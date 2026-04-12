using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Application.Common.DTOs.DailyEntries;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using WheatTrace.Infrastructure.Data;
using Microsoft.AspNetCore.SignalR;
using WheatTrace.Api.Hubs;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/daily-entries")]
[Authorize]
public class DailyEntriesController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IHolidayService _holidays;
    private readonly IAuditService _audit;
    private readonly IHubContext<LiveUpdateHub> _hubContext;

    // Edit lock window in minutes
    private const int EditWindowMinutes = 60;

    public DailyEntriesController(
        WheatTraceDbContext db,
        ICurrentUserService currentUser,
        IHolidayService holidays,
        IAuditService audit,
        IHubContext<LiveUpdateHub> hubContext)
    {
        _db = db;
        _currentUser = currentUser;
        _holidays = holidays;
        _audit = audit;
        _hubContext = hubContext;
    }

    /// <summary>خاص بالمفتشين: جلب تفاصيل مدخلات التوريد اليومية المرتبطة بموقع وتاريخ انتداب المفتش.</summary>
    [HttpGet("my")]
    [Authorize(Policy = "InspectorOrAbove")]
    public async Task<ActionResult<DailyEntryDto>> GetMine([FromQuery] DateOnly? date)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.Today);
        var assignment = await _db.InspectorAssignments
            .AsNoTracking()
            .Include(a => a.Site).ThenInclude(s => s!.Governorate)
            .Include(a => a.Shift)
            .FirstOrDefaultAsync(a =>
                a.InspectorId == _currentUser.UserId &&
                a.Date == targetDate &&
                a.IsActive);

        if (assignment is null)
            return NotFound(new { message = "لا يوجد تعيين لهذا اليوم" });

        var entry = await _db.DailyEntries
            .AsNoTracking()
            .Include(e => e.Rejection)
            .FirstOrDefaultAsync(e =>
                e.SiteId == assignment.SiteId &&
                e.Date == targetDate &&
                e.ShiftId == assignment.ShiftId);

        if (entry is null) return NoContent();

        return Ok(MapToDto(entry, assignment));
    }

    /// <summary>Inspector: create a daily entry. Site/shift auto-resolved from assignment.</summary>
    [HttpPost]
    [Authorize(Roles = "Inspector")]
    public async Task<ActionResult<DailyEntryDto>> Create([FromBody] CreateDailyEntryRequest request)
    {
        // 1. Resolve assignment
        var assignment = await _db.InspectorAssignments
            .Include(a => a.Site)
            .Include(a => a.Shift)
            .FirstOrDefaultAsync(a =>
                a.InspectorId == _currentUser.UserId &&
                a.Date == request.Date &&
                a.IsActive);

        if (assignment is null)
            return Forbid(); // No active assignment = no entry

        // 2. Holiday check
        if (await _holidays.IsHolidayAsync(request.Date, assignment.SiteId, assignment.Site?.GovernorateId))
            return BadRequest(new { message = "اليوم عطلة - لا يمكن التسجيل" });

        // 3. Shift mode validation
        if (assignment.Site!.IsShiftEnabled && assignment.ShiftId is null)
            return BadRequest(new { message = "الموقع يعمل بنظام الشفتات - لا يوجد شفت مرتبط بتعيينك" });

        // 4. Duplicate check
        var exists = await _db.DailyEntries.AnyAsync(e =>
            e.SiteId == assignment.SiteId &&
            e.Date == request.Date &&
            e.ShiftId == assignment.ShiftId);

        if (exists)
            return Conflict(new { message = "تم تسجيل كميات لهذا اليوم مسبقاً" });

        // 5. Capacity check (pessimistic lock)
        var totalKg = CalcTotalKg(request.Wheat22_5, request.Wheat23, request.Wheat23_5);

        await using var tx = await _db.Database.BeginTransactionAsync();
        var site = await _db.StorageSites
            .FromSqlRaw("SELECT * FROM storage_sites WHERE id = {0} FOR UPDATE", assignment.SiteId)
            .FirstAsync();

        try { site.ApplyTransaction(totalKg, true); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }

        // 6. Persist
        var entry = new DailyEntry
        {
            Id = Guid.NewGuid(),
            SiteId = assignment.SiteId,
            Date = request.Date,
            InspectorId = _currentUser.UserId,
            ShiftId = assignment.ShiftId,
            Wheat22_5Ton = request.Wheat22_5.Ton,
            Wheat22_5Kg = request.Wheat22_5.Kg,
            Wheat23Ton = request.Wheat23.Ton,
            Wheat23Kg = request.Wheat23.Kg,
            Wheat23_5Ton = request.Wheat23_5.Ton,
            Wheat23_5Kg = request.Wheat23_5.Kg,
            Notes = request.Notes
        };

        _db.DailyEntries.Add(entry);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        await _audit.LogAsync("Create", "DailyEntry", entry.Id, newValues: new { entry.SiteId, entry.Date });

        // Phase 8: Emit Live Update
        await EmitLiveUpdate(site.GovernorateId);

        // Reload with Rejection (null for new entry)
        return CreatedAtAction(nameof(GetMine), new { date = request.Date }, MapToDto(entry, assignment));
    }

    /// <summary>Inspector: update entry within 1-hour window.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Inspector")]
    public async Task<ActionResult<DailyEntryDto>> Update(Guid id, [FromBody] UpdateDailyEntryRequest request)
    {
        var entry = await _db.DailyEntries
            .Include(e => e.Site)
            .Include(e => e.Rejection)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entry is null) return NotFound();
        if (entry.InspectorId != _currentUser.UserId) return Forbid();

        // 1-hour window check
        if (entry.CreatedAt.AddMinutes(EditWindowMinutes) < DateTime.UtcNow)
            return BadRequest(new { message = "انتهت فترة التعديل المباشر (ساعة واحدة). يرجى إرسال طلب تعديل." });

        // Holiday check
        if (await _holidays.IsHolidayAsync(entry.Date, entry.SiteId, entry.Site?.GovernorateId))
            return BadRequest(new { message = "لا يمكن التعديل في يوم العطلة" });

        var newTotalKg = CalcTotalKg(request.Wheat22_5, request.Wheat23, request.Wheat23_5);
        var oldTotalKg = entry.TotalQtyKg;
        var delta = newTotalKg - oldTotalKg;

        await using var tx = await _db.Database.BeginTransactionAsync();
        var site = await _db.StorageSites
            .FromSqlRaw("SELECT * FROM storage_sites WHERE id = {0} FOR UPDATE", entry.SiteId)
            .FirstAsync();

        try { site.ApplyTransaction(delta, true); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }

        var old = new { entry.Wheat22_5Ton, entry.Wheat22_5Kg, entry.Wheat23Ton, entry.Wheat23Kg, entry.Wheat23_5Ton, entry.Wheat23_5Kg };

        entry.Wheat22_5Ton = request.Wheat22_5.Ton;
        entry.Wheat22_5Kg  = request.Wheat22_5.Kg;
        entry.Wheat23Ton   = request.Wheat23.Ton;
        entry.Wheat23Kg    = request.Wheat23.Kg;
        entry.Wheat23_5Ton = request.Wheat23_5.Ton;
        entry.Wheat23_5Kg  = request.Wheat23_5.Kg;
        entry.Notes        = request.Notes;
        entry.UpdatedAt    = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        await _audit.LogAsync("Update", "DailyEntry", entry.Id, old, new { entry.Wheat22_5Ton, entry.Wheat22_5Kg });

        // Phase 8: Emit Live Update
        await EmitLiveUpdate(site.GovernorateId);

        var assignment = await _db.InspectorAssignments
            .Include(a => a.Site).Include(a => a.Shift)
            .FirstOrDefaultAsync(a => a.InspectorId == _currentUser.UserId && a.Date == entry.Date && a.IsActive);

        return Ok(MapToDto(entry, assignment));
    }

    /// <summary>Inspector: submit edit request after 1-hour lock.</summary>
    [HttpPost("{id:guid}/edit-requests")]
    [Authorize(Roles = "Inspector")]
    public async Task<ActionResult> RequestEdit(Guid id, [FromBody] CreateEditRequest request)
    {
        var entry = await _db.DailyEntries.FindAsync(id);
        if (entry is null) return NotFound();
        if (entry.InspectorId != _currentUser.UserId) return Forbid();

        var editReq = new EditRequest
        {
            Id = Guid.NewGuid(),
            EntryId = id,
            RequestedById = _currentUser.UserId,
            NewWheat22_5 = request.NewWheat22_5 is null ? null : request.NewWheat22_5.Ton * 1000 + request.NewWheat22_5.Kg,
            NewWheat23   = request.NewWheat23   is null ? null : request.NewWheat23.Ton   * 1000 + request.NewWheat23.Kg,
            NewWheat23_5 = request.NewWheat23_5 is null ? null : request.NewWheat23_5.Ton * 1000 + request.NewWheat23_5.Kg,
        };

        _db.EditRequests.Add(editReq);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("EditRequest", "EditRequest", editReq.Id);

        // 🔔 Notify the governorate manager via SignalR
        var entry2 = await _db.DailyEntries
            .Include(e => e.Site)
            .Include(e => e.Inspector)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entry2?.Site?.GovernorateId is Guid govId)
            await _hubContext.Clients.Group($"Governorate-{govId}").SendAsync("EditRequestPending");

        return Ok(new { message = "تم إرسال طلب التعديل للمسؤول" });
    }

    /// <summary>
    /// GovernorateManager: يرفع طلب تعديل كمية — يُوجَّه للموافقة من مراقب العمليات.
    /// </summary>
    [HttpPost("{id:guid}/manager-edit-request")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> ManagerRequestEdit(Guid id, [FromBody] ManagerEditRequestBody request)
    {
        var entry = await _db.DailyEntries.Include(e => e.Site).FirstOrDefaultAsync(e => e.Id == id);
        if (entry is null) return NotFound();

        // المدير يقدر يطلب تعديل لمواقع محافظته فقط
        if (_currentUser.Role == "GovernorateManager" &&
            entry.Site?.GovernorateId != _currentUser.GovernorateId)
            return Forbid();

        // لا يُسمح بطلب تعديل معلق على نفس السجل بالفعل
        var hasPending = await _db.EditRequests.AnyAsync(r =>
            r.EntryId == id &&
            r.Status == RequestStatus.Pending);
        if (hasPending)
            return BadRequest(new { message = "يوجد طلب تعديل معلق بالفعل لهذا السجل" });

        var editReq = new EditRequest
        {
            Id              = Guid.NewGuid(),
            EntryId         = id,
            RequestedById   = _currentUser.UserId,
            RequestedByRole = _currentUser.Role,
            EditReason      = request.Reason,
            NewWheat22_5    = request.NewWheat22_5 is null ? null : (decimal?)(request.NewWheat22_5.Ton * 1000 + request.NewWheat22_5.Kg),
            NewWheat23      = request.NewWheat23   is null ? null : (decimal?)(request.NewWheat23.Ton   * 1000 + request.NewWheat23.Kg),
            NewWheat23_5    = request.NewWheat23_5 is null ? null : (decimal?)(request.NewWheat23_5.Ton * 1000 + request.NewWheat23_5.Kg),
        };

        _db.EditRequests.Add(editReq);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("ManagerEditRequest", "EditRequest", editReq.Id);

        // 🔔 إشعار عبر SignalR لكل مراقبي العمليات
        await _hubContext.Clients.Group("Monitor-All").SendAsync("ManagerEditRequestPending", new
        {
            siteName      = entry.Site?.Name,
            entryDate     = entry.Date,
            requestedBy   = _currentUser.UserId
        });

        return Ok(new { message = "تم إرسال طلب التعديل لمراقب العمليات للموافقة" });
    }

    /// <summary>Manager: list pending edit requests for their scope.</summary>
    [HttpGet("edit-requests")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetEditRequests([FromQuery] bool? pendingOnly)
    {
        var q = _db.EditRequests
            .AsNoTracking()
            .Include(r => r.Entry).ThenInclude(e => e!.Site).ThenInclude(s => s!.Governorate)
            .Include(r => r.RequestedBy)
            .Include(r => r.ApprovedBy)
            .AsQueryable();

        if (_currentUser.Role == "GovernorateManager" && _currentUser.GovernorateId.HasValue)
            q = q.Where(r => r.Entry!.Site!.GovernorateId == _currentUser.GovernorateId);

        if (pendingOnly == true)
            q = q.Where(r => r.Status == RequestStatus.Pending);

        var list = await q.OrderByDescending(r => r.CreatedAt).Select(r => new
        {
            r.Id, r.Status,
            EntryId = r.EntryId,
            EntryDate = r.Entry!.Date,
            SiteName = r.Entry.Site!.Name,
            GovernorateName = r.Entry.Site.Governorate!.Name,
            InspectorName = r.RequestedBy!.Name,
            r.NewWheat22_5, r.NewWheat23, r.NewWheat23_5,
            r.RejectionReason, r.ApprovedAt,
            ApprovedBy = r.ApprovedBy != null ? r.ApprovedBy.Name : null,
            r.CreatedAt
        }).ToListAsync();

        return Ok(list);
    }

    /// <summary>Manager: count pending edit requests (for badge).</summary>
    [HttpGet("edit-requests/pending-count")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult<int>> GetPendingEditCount()
    {
        var q = _db.EditRequests
            .AsNoTracking()
            .Include(r => r.Entry).ThenInclude(e => e!.Site)
            .Where(r => r.Status == RequestStatus.Pending);

        if (_currentUser.Role == "GovernorateManager" && _currentUser.GovernorateId.HasValue)
            q = q.Where(r => r.Entry!.Site!.GovernorateId == _currentUser.GovernorateId);

        return Ok(await q.CountAsync());
    }

    /// <summary>Manager: approve an edit request.</summary>
    [HttpPost("edit-requests/{requestId:guid}/approve")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> ApproveEditRequest(Guid requestId)
    {
        var req = await _db.EditRequests
            .Include(r => r.Entry).ThenInclude(e => e!.Site)
            .Include(r => r.RequestedBy)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (req is null) return NotFound();
        if (req.Status != RequestStatus.Pending)
            return BadRequest(new { message = "تم معالجة هذا الطلب مسبقاً" });

        // التحقق من صلاحية الموافقة:
        // - طلب المفتش: يوافق مدير المحافظة أو أعلى
        // - طلب المدير: يوافق مراقب العمليات أو أعلى
        if (req.RequestedByRole == "GovernorateManager")
        {
            var canApprove = _currentUser.Role is "Monitor" or "GeneralMonitor" or "Admin";
            if (!canApprove) return Forbid();
        }
        else
        {
            if (!WheatTrace.Application.Common.Security.RbacHelper.CanAccessSite(
                _currentUser.Role, _currentUser.GovernorateId, req.Entry!.Site!.GovernorateId))
                return Forbid();
        }

        var entry = req.Entry!;
        var oldTotalKg = entry.TotalQtyKg;
        var newWheat22_5Kg = req.NewWheat22_5.HasValue ? (long)req.NewWheat22_5.Value : (long)entry.Wheat22_5Ton * 1000 + entry.Wheat22_5Kg;
        var newWheat23Kg = req.NewWheat23.HasValue ? (long)req.NewWheat23.Value : (long)entry.Wheat23Ton * 1000 + entry.Wheat23Kg;
        var newWheat23_5Kg = req.NewWheat23_5.HasValue ? (long)req.NewWheat23_5.Value : (long)entry.Wheat23_5Ton * 1000 + entry.Wheat23_5Kg;
        var newTotalKg = newWheat22_5Kg + newWheat23Kg + newWheat23_5Kg;
        var delta = newTotalKg - oldTotalKg;

        await using var tx = await _db.Database.BeginTransactionAsync();
        var site = await _db.StorageSites
            .FromSqlRaw("SELECT * FROM storage_sites WHERE id = {0} FOR UPDATE", entry.SiteId)
            .FirstAsync();

        try { site.ApplyTransaction(delta, true); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }

        // Apply the new values (keep old value if not provided in request)
        if (req.NewWheat22_5.HasValue) { entry.Wheat22_5Ton = (int)(req.NewWheat22_5.Value / 1000); entry.Wheat22_5Kg = (int)(req.NewWheat22_5.Value % 1000); }
        if (req.NewWheat23.HasValue)   { entry.Wheat23Ton   = (int)(req.NewWheat23.Value   / 1000); entry.Wheat23Kg   = (int)(req.NewWheat23.Value   % 1000); }
        if (req.NewWheat23_5.HasValue) { entry.Wheat23_5Ton = (int)(req.NewWheat23_5.Value / 1000); entry.Wheat23_5Kg = (int)(req.NewWheat23_5.Value % 1000); }

        entry.UpdatedAt = DateTime.UtcNow;

        // إذا كان المُعدِّل هو المدير → نضع العلامة البصرية على السجل
        if (req.RequestedByRole == "GovernorateManager")
        {
            entry.IsEditedByManager = true;
            entry.ManagerEditNote   = req.EditReason;
            entry.EditApprovedAt    = DateTime.UtcNow;
        }

        req.Status     = RequestStatus.Approved;
        req.ApprovedById = _currentUser.UserId;
        req.ApprovedAt   = DateTime.UtcNow;

        // 🔔 Notify inspector via InspectorMessage
        var siteId = entry.SiteId;
        _db.InspectorMessages.Add(new Domain.Entities.InspectorMessage
        {
            Id = Guid.NewGuid(),
            SenderUserId         = _currentUser.UserId,
            RecipientInspectorId = req.RequestedById,
            SiteId               = siteId,
            Message              = $"✅ تمت الموافقة على طلب التعديل الخاص بك لتسجيل يوم {entry.Date:d/M/yyyy} في موقع '{entry.Site?.Name}'.",
            IsRead               = false,
            CreatedAt            = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        await tx.CommitAsync();
        await _audit.LogAsync("ApproveEditRequest", "EditRequest", requestId);
        await EmitLiveUpdate(req.Entry.Site?.GovernorateId);

        return Ok(new { message = "تم اعتماد التعديل وتطبيقه" });
    }

    /// <summary>Manager: reject an edit request.</summary>
    [HttpPost("edit-requests/{requestId:guid}/reject")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> RejectEditRequest(Guid requestId, [FromBody] RejectEditRequestBody body)
    {
        var req = await _db.EditRequests
            .Include(r => r.Entry).ThenInclude(e => e!.Site)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (req is null) return NotFound();
        if (req.Status != RequestStatus.Pending)
            return BadRequest(new { message = "تم معالجة هذا الطلب مسبقاً" });

        // نفس منطق الموافقة — طلب المدير ← مراقب العمليات، طلب المفتش ← المدير
        if (req.RequestedByRole == "GovernorateManager")
        {
            var canReject = _currentUser.Role is "Monitor" or "GeneralMonitor" or "Admin";
            if (!canReject) return Forbid();
        }
        else
        {
            if (!WheatTrace.Application.Common.Security.RbacHelper.CanAccessSite(
                _currentUser.Role, _currentUser.GovernorateId, req.Entry!.Site!.GovernorateId))
                return Forbid();
        }

        req.Status          = RequestStatus.Rejected;
        req.RejectionReason = body.Reason;
        req.ApprovedById    = _currentUser.UserId;
        req.ApprovedAt      = DateTime.UtcNow;

        // 🔔 Notify inspector
        _db.InspectorMessages.Add(new Domain.Entities.InspectorMessage
        {
            Id = Guid.NewGuid(),
            SenderUserId         = _currentUser.UserId,
            RecipientInspectorId = req.RequestedById,
            SiteId               = req.Entry!.SiteId,
            Message              = $"❌ تم رفض طلب التعديل الخاص بك لتسجيل يوم {req.Entry.Date:d/M/yyyy}.{(string.IsNullOrEmpty(body.Reason) ? "" : " السبب: " + body.Reason)}",
            IsRead               = false,
            CreatedAt            = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        await _audit.LogAsync("RejectEditRequest", "EditRequest", requestId);

        return Ok(new { message = "تم رفض طلب التعديل" });
    }

    /// <summary>Monitor/Manager: grid view with filters.</summary>
    [HttpGet("grid")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult<IEnumerable<DailyEntryDto>>> Grid(
        [FromQuery] DateOnly? date,
        [FromQuery] Guid? governorateId,
        [FromQuery] Guid? authorityId,
        [FromQuery] Guid? districtId,
        [FromQuery] Guid? siteId)
    {
        var q = _db.DailyEntries
            .AsNoTracking()
            .Include(e => e.Site).ThenInclude(s => s!.Governorate)
            .Include(e => e.Site).ThenInclude(s => s!.District)
            .Include(e => e.Site).ThenInclude(s => s!.Authority)
            .Include(e => e.Inspector)
            .Include(e => e.Shift)
            .Include(e => e.Rejection)
            .AsQueryable();

        // Role-based scoping: GovernorateManager sees only their governorate
        if (_currentUser.Role == "GovernorateManager" && _currentUser.GovernorateId.HasValue)
            q = q.Where(e => e.Site!.GovernorateId == _currentUser.GovernorateId);

        if (date.HasValue)       q = q.Where(e => e.Date == date);
        if (governorateId.HasValue) q = q.Where(e => e.Site!.GovernorateId == governorateId);
        if (authorityId.HasValue)   q = q.Where(e => e.Site!.AuthorityId   == authorityId);
        if (districtId.HasValue)    q = q.Where(e => e.Site!.DistrictId    == districtId);
        if (siteId.HasValue)        q = q.Where(e => e.SiteId              == siteId);

        var entries = await q.OrderByDescending(e => e.Date).ThenBy(e => e.Site!.Name).ToListAsync();
        return Ok(entries.Select(e => MapToDto(e, null)));
    }

    /// <summary>Offline sync batch — server-authoritative validation on each item.</summary>
    [HttpPost("sync-batches")]
    [Authorize(Roles = "Inspector")]
    public async Task<ActionResult<IEnumerable<SyncBatchResult>>> SyncBatch([FromBody] SyncBatchRequest request)
    {
        var results = new List<SyncBatchResult>();

        foreach (var item in request.Items)
        {
            // Resolve assignment at sync time (not client time)
            var assignment = await _db.InspectorAssignments
                .Include(a => a.Site)
                .FirstOrDefaultAsync(a =>
                    a.InspectorId == _currentUser.UserId &&
                    a.Date == item.Date &&
                    a.IsActive);

             if (assignment is null)
            {
                results.Add(new SyncBatchResult(false, null, "لا يوجد تعيين نشط في هذا اليوم"));
                continue;
            }

            if (assignment.Site!.IsShiftEnabled && assignment.ShiftId is null)
            {
                results.Add(new SyncBatchResult(false, null, "الموقع يعمل بنظام الشفتات ولا يوجد شفت مرتبط بتعيينك"));
                continue;
            }

            // Holiday check
            if (await _holidays.IsHolidayAsync(item.Date, assignment.SiteId, assignment.Site?.GovernorateId))
            {
                results.Add(new SyncBatchResult(false, null, "اليوم عطلة"));
                continue;
            }

            var totalKg = CalcTotalKg(item.Wheat22_5, item.Wheat23, item.Wheat23_5);

            // New entry
            if (item.ExistingEntryId is null)
            {
                var exists = await _db.DailyEntries.AnyAsync(e =>
                    e.SiteId == assignment.SiteId && e.Date == item.Date && e.ShiftId == assignment.ShiftId);
                if (exists)
                {
                    results.Add(new SyncBatchResult(false, null, "تم التسجيل مسبقاً لهذا اليوم"));
                    continue;
                }

                await using var tx = await _db.Database.BeginTransactionAsync();
                var site = await _db.StorageSites
                    .FromSqlRaw("SELECT * FROM storage_sites WHERE id = {0} FOR UPDATE", assignment.SiteId)
                    .FirstAsync();

                try 
                { 
                    site.ApplyTransaction(totalKg, true); 
                }
                catch (InvalidOperationException ex) 
                { 
                    results.Add(new SyncBatchResult(false, null, ex.Message));
                    continue;
                }

                var entry = new DailyEntry
                {
                    Id = Guid.NewGuid(),
                    SiteId = assignment.SiteId, Date = item.Date,
                    InspectorId = _currentUser.UserId, ShiftId = assignment.ShiftId,
                    Wheat22_5Ton = item.Wheat22_5.Ton, Wheat22_5Kg = item.Wheat22_5.Kg,
                    Wheat23Ton = item.Wheat23.Ton,     Wheat23Kg = item.Wheat23.Kg,
                    Wheat23_5Ton = item.Wheat23_5.Ton, Wheat23_5Kg = item.Wheat23_5.Kg,
                    Notes = item.Notes
                };

                _db.DailyEntries.Add(entry);
                await _db.SaveChangesAsync();
                await tx.CommitAsync();
                results.Add(new SyncBatchResult(true, entry.Id, null));
            }
            else
            {
                // Update if still within edit window
                var existing = await _db.DailyEntries.FirstOrDefaultAsync(e => e.Id == item.ExistingEntryId);
                if (existing is null) { results.Add(new SyncBatchResult(false, null, "التسجيل غير موجود")); continue; }
                if (existing.InspectorId != _currentUser.UserId) { results.Add(new SyncBatchResult(false, existing.Id, "غير مصرح لك بتعديل هذا التسجيل")); continue; }
                if (existing.SiteId != assignment.SiteId || existing.Date != item.Date || existing.ShiftId != assignment.ShiftId)
                {
                    results.Add(new SyncBatchResult(false, existing.Id, "التسجيل لا يطابق التعيين النشط الحالي"));
                    continue;
                }
                if (existing.RowVersion is not null && BitConverter.ToInt64(existing.RowVersion) != item.RowVersion)
                {
                    results.Add(new SyncBatchResult(false, existing.Id, "تعارض في البيانات - تم تعديل التسجيل مؤخراً"));
                    continue;
                }
                if (existing.CreatedAt.AddMinutes(EditWindowMinutes) < DateTime.UtcNow)
                {
                    results.Add(new SyncBatchResult(false, existing.Id, "انتهت فترة التعديل المباشر"));
                    continue;
                }

                var oldTotalKg = existing.TotalQtyKg;
                var delta = totalKg - oldTotalKg;

                await using var tx = await _db.Database.BeginTransactionAsync();
                var site = await _db.StorageSites
                    .FromSqlRaw("SELECT * FROM storage_sites WHERE id = {0} FOR UPDATE", existing.SiteId)
                    .FirstAsync();

                try 
                { 
                    site.ApplyTransaction(delta, true); 
                }
                catch (InvalidOperationException ex) 
                { 
                    results.Add(new SyncBatchResult(false, existing.Id, ex.Message));
                    continue;
                }

                existing.Wheat22_5Ton = item.Wheat22_5.Ton; existing.Wheat22_5Kg = item.Wheat22_5.Kg;
                existing.Wheat23Ton   = item.Wheat23.Ton;   existing.Wheat23Kg   = item.Wheat23.Kg;
                existing.Wheat23_5Ton = item.Wheat23_5.Ton; existing.Wheat23_5Kg = item.Wheat23_5.Kg;
                existing.Notes = item.Notes; existing.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                await tx.CommitAsync();
                results.Add(new SyncBatchResult(true, existing.Id, null));
            }
        }

        if (results.Any(r => r.Success))
        {
            // Simple generic update for sync
            await _hubContext.Clients.Group("Egypt-All").SendAsync("DailyEntryUpdated");
        }

        return Ok(results);
    }

    // ---- Helpers -------------------------------------------
    private async Task EmitLiveUpdate(Guid? governorateId)
    {
        await _hubContext.Clients.Group("Egypt-All").SendAsync("DailyEntryUpdated");
        if (governorateId.HasValue)
        {
            await _hubContext.Clients.Group($"Governorate-{governorateId.Value}").SendAsync("DailyEntryUpdated");
        }
    }
    private static long CalcTotalKg(GradeQuantityDto g1, GradeQuantityDto g2, GradeQuantityDto g3)
        => (long)(g1.Ton * 1000 + g1.Kg) + (g2.Ton * 1000 + g2.Kg) + (g3.Ton * 1000 + g3.Kg);

    private static string FormatTotalDisplay(long totalKg)
        => $"{totalKg / 1000} طن {totalKg % 1000} كجم";

    private static DailyEntryDto MapToDto(DailyEntry e, InspectorAssignment? assignment)
    {
        var isEditable = e.CreatedAt.AddMinutes(EditWindowMinutes) > DateTime.UtcNow;
        return new DailyEntryDto(
            Id: e.Id,
            SiteId: e.SiteId,
            SiteName: e.Site?.Name ?? "",
            Date: e.Date,
            InspectorId: e.InspectorId,
            InspectorName: e.Inspector?.Name ?? "",
            ShiftId: e.ShiftId,
            ShiftName: e.Shift?.Name,
            Wheat22_5: new GradeQuantityDto(e.Wheat22_5Ton, e.Wheat22_5Kg),
            Wheat23:   new GradeQuantityDto(e.Wheat23Ton,   e.Wheat23Kg),
            Wheat23_5: new GradeQuantityDto(e.Wheat23_5Ton, e.Wheat23_5Kg),
            TotalQtyKg: e.TotalQtyKg,
            TotalDisplay: FormatTotalDisplay(e.TotalQtyKg),
            Notes: e.Notes,
            IsEditable: isEditable,
            IsEditedByManager: e.IsEditedByManager,
            ManagerEditNote: e.ManagerEditNote,
            EditApprovedAt: e.EditApprovedAt,
            Rejection: e.Rejection is null ? null : new RejectionDto(
                e.Rejection.Id,
                e.Rejection.TotalRejectionTon,
                e.Rejection.MoistureTon,
                e.Rejection.SandGravelTon,
                e.Rejection.ImpuritiesTon,
                e.Rejection.InsectDamageTon,
                e.Rejection.TreatedQuantityTon
            )
        );
    }
}

public record RejectEditRequestBody(string? Reason);

/// <summary>طلب تعديل كمية من مدير المحافظة — يحتاج موافقة مراقب العمليات</summary>
public record ManagerEditRequestBody(
    string? Reason,
    GradeQuantityDto? NewWheat22_5,
    GradeQuantityDto? NewWheat23,
    GradeQuantityDto? NewWheat23_5
);
