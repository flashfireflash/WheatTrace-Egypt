using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Application.Common.DTOs.Assignments;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IHolidayService _holidays;
    private readonly IAuditService _audit;

    public AssignmentsController(WheatTraceDbContext db, ICurrentUserService cu, IHolidayService h, IAuditService a)
    {
        _db = db; _currentUser = cu; _holidays = h; _audit = a;
    }

    /// <summary>Inspector: get my assignment for a date.</summary>
    [HttpGet("my")]
    public async Task<ActionResult<AssignmentDto>> GetMine([FromQuery] DateOnly? date)
    {
        var d = date ?? DateOnly.FromDateTime(DateTime.Today);
        var a = await _db.InspectorAssignments
            .Include(x => x.Inspector)
            .Include(x => x.Site).ThenInclude(s => s!.Governorate)
            .Include(x => x.Site).ThenInclude(s => s!.District)
            .Include(x => x.Site).ThenInclude(s => s!.TransfersOut)
            .Include(x => x.Shift)
            .FirstOrDefaultAsync(x => x.InspectorId == _currentUser.UserId && x.Date == d && x.IsActive);

        if (a is null) return NotFound(new { message = "لا يوجد تعيين لهذا اليوم" });
        return Ok(MapDto(a));
    }

    /// <summary>Inspector: history of their assignments across date range</summary>
    [HttpGet("my-history")]
    public async Task<ActionResult> GetMyHistory([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        var assignments = await _db.InspectorAssignments
            .Include(x => x.Site)
            .Include(x => x.Shift)
            .Where(x => x.InspectorId == _currentUser.UserId && x.Date >= startDate && x.Date <= endDate && x.IsActive)
            .OrderByDescending(x => x.Date)
            .ToListAsync();

        var dtoList = new List<object>();

        foreach (var a in assignments)
        {
            bool isHoliday = await _holidays.IsHolidayAsync(a.Date, a.SiteId, a.Site?.GovernorateId);
            dtoList.Add(new
            {
                a.Id,
                a.Date,
                SiteId   = a.SiteId,
                SiteName = a.Site?.Name,
                ShiftName = a.Shift?.Name,
                IsHoliday = isHoliday
            });
        }

        return Ok(dtoList);
    }

    /// <summary>GovernorateManager: list all assignments for their governorate on a date.</summary>
    [HttpGet]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult<IEnumerable<AssignmentDto>>> List(
        [FromQuery] DateOnly? date,
        [FromQuery] Guid? siteId,
        [FromQuery] Guid? inspectorId)
    {
        var q = _db.InspectorAssignments
            .Include(a => a.Inspector)
            .Include(a => a.Site).ThenInclude(s => s!.Governorate)
            .Include(a => a.Site).ThenInclude(s => s!.District)
            .Include(a => a.Shift)
            .AsQueryable();

        if (_currentUser.Role == "GovernorateManager")
            q = q.Where(a => a.Site!.GovernorateId == _currentUser.GovernorateId);

        if (date.HasValue)       q = q.Where(a => a.Date == date);
        if (siteId.HasValue)     q = q.Where(a => a.SiteId == siteId);
        if (inspectorId.HasValue) q = q.Where(a => a.InspectorId == inspectorId);

        return Ok((await q.ToListAsync()).Select(MapDto));
    }

    /// <summary>GovernorateManager: assign inspector to a site for a date.</summary>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult<AssignmentDto>> Assign([FromBody] AssignInspectorRequest request)
    {
        // ── 1. Site exists + scope check ────────────────────────────────────
        var site = await _db.StorageSites.FindAsync(request.SiteId);
        if (site is null) return NotFound(new { message = "الموقع التخزيني غير موجود" });

        if (_currentUser.Role == "GovernorateManager" && site.GovernorateId != _currentUser.GovernorateId)
            return Forbid();

        // ── 2. Holiday check ────────────────────────────────────────────────
        if (await _holidays.IsHolidayAsync(request.Date, site.Id, site.GovernorateId))
            return BadRequest(new { message = "لا يمكن التعيين في يوم العطلة لهذا الموقع" });

        // ── 3. Inspector exists ─────────────────────────────────────────────
        var inspector = await _db.Users.FindAsync(request.InspectorId);
        if (inspector is null || (inspector.Role != UserRole.Inspector && inspector.Role != UserRole.GovernorateManager))
            return BadRequest(new { message = "المستخدم ليس مفتشاً ولا مدير محافظة" });

        // ── 4. Determine whether site is in dual-shift mode on this date ────
        bool isDualShift = site.IsShiftEnabled;
        // Also check exception-date range (temporary dual-shift window)
        if (site.ExceptionStartDate.HasValue && site.ExceptionEndDate.HasValue)
        {
            bool inException = request.Date >= site.ExceptionStartDate &&
                               request.Date <= site.ExceptionEndDate;
            isDualShift = inException; // exception overrides IsShiftEnabled
        }

        // ── 5. Validate shift argument ──────────────────────────────────────
        if (isDualShift && request.ShiftId == null)
            return BadRequest(new { message = "هذا الموقع يعمل بنظام الورديتين. يجب تحديد الوردية عند التعيين." });

        if (!isDualShift && request.ShiftId != null)
            return BadRequest(new { message = "هذا الموقع يعمل بوردية واحدة. لا تحدد وردية." });

        // ── 6. Capacity check per shift mode ────────────────────────────────
        var activeOnSiteToday = await _db.InspectorAssignments
            .Where(a => a.SiteId == request.SiteId && a.Date == request.Date && a.IsActive)
            .ToListAsync();

        if (!isDualShift)
        {
            // Single-shift: only ONE inspector allowed per site per day
            if (activeOnSiteToday.Count >= 1)
            {
                var existing = activeOnSiteToday[0];
                return Conflict(new
                {
                    message = "هذا الموقع يعمل بوردية واحدة وهناك مفتش معيَّن بالفعل. يجب إلغاء التعيين الحالي أولاً.",
                    existingInspectorId = existing.InspectorId
                });
            }
        }
        else
        {
            // Dual-shift: max ONE inspector per shift
            var shiftTaken = activeOnSiteToday.Any(a => a.ShiftId == request.ShiftId);
            if (shiftTaken)
            {
                return Conflict(new
                {
                    message = "هذه الوردية مشغولة بالفعل بمفتش آخر في هذا الموقع. اختر الوردية الأخرى أو ألغِ التعيين الحالي.",
                    shiftId = request.ShiftId
                });
            }
        }

        // ── 7. Inspector already assigned somewhere else today? ─────────────
        var inspectorBusy = await _db.InspectorAssignments
            .AnyAsync(a => a.InspectorId == request.InspectorId &&
                           a.Date == request.Date &&
                           a.IsActive &&
                           a.SiteId != request.SiteId);
        if (inspectorBusy)
            return Conflict(new { message = "هذا المفتش معيَّن بالفعل لموقع آخر في نفس اليوم." });

        // ── 8. Deactivate previous assignment of THIS inspector (same site, different shift) ──
        var previousSameSite = await _db.InspectorAssignments
            .Where(a => a.InspectorId == request.InspectorId &&
                        a.SiteId == request.SiteId &&
                        a.Date == request.Date &&
                        a.IsActive)
            .ToListAsync();

        foreach (var old in previousSameSite)
        {
            old.IsActive = false;
            old.AssignmentStatus = AssignmentStatus.Replaced;
            old.UpdatedAt = DateTime.UtcNow;
        }

        // ── 9. Create new assignment ────────────────────────────────────────
        var assignment = new InspectorAssignment
        {
            Id          = Guid.NewGuid(),
            InspectorId = request.InspectorId,
            SiteId      = request.SiteId,
            ShiftId     = isDualShift ? request.ShiftId : null,
            Date        = request.Date,
            EndDate     = request.EndDate
        };

        _db.InspectorAssignments.Add(assignment);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("uix_assignment") == true)
        {
            return Conflict(new { message = "لا يمكن تعيين هذا المفتش مرتين في نفس الموقع والوردية." });
        }

        await _audit.LogAsync("Create", "Assignment", assignment.Id, newValues: request);

        await _db.Entry(assignment).Reference(a => a.Inspector).LoadAsync();
        await _db.Entry(assignment).Reference(a => a.Site).LoadAsync();
        await _db.Entry(assignment).Reference(a => a.Shift).LoadAsync();

        // 🔔 إشعار المفتش بالتعيين الجديد مع تفاصيل الفترة الزمنية
        var dateRangeText = request.EndDate.HasValue
            ? $"في الفترة من {request.Date:d/M/yyyy} إلى {request.EndDate:d/M/yyyy}"
            : $"اعتباراً من {request.Date:d/M/yyyy} (مفتوح المدة)";
        await SendInspectorNotification(
            inspectorId:  request.InspectorId,
            siteId:       request.SiteId,
            senderUserId: _currentUser.UserId,
            message:      $"📌 تم تعيينك على موقع '{site.Name}' {dateRangeText}."
        );

        return CreatedAtAction(nameof(GetMine), MapDto(assignment));
    }

    /// <summary>GovernorateManager: deactivate an assignment (put inspector on rest).</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> Deactivate(Guid id)
    {
        var assignment = await _db.InspectorAssignments
            .Include(a => a.Site)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment is null) return NotFound();

        if (_currentUser.Role == "GovernorateManager" && assignment.Site!.GovernorateId != _currentUser.GovernorateId)
            return Forbid();

        assignment.IsActive = false;
        assignment.AssignmentStatus = AssignmentStatus.Inactive;
        assignment.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Deactivate", "Assignment", id);

        return NoContent();
    }

    /// <summary>
    /// Update the end date (and optional notes) of a temporary assignment.
    /// Used to manage cross-governorate loan period.
    /// </summary>
    [HttpPatch("{id:guid}/end-date")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> UpdateEndDate(Guid id, [FromBody] UpdateEndDateRequest req)
    {
        var assignment = await _db.InspectorAssignments
            .Include(a => a.Site)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment is null) return NotFound();

        if (_currentUser.Role == "GovernorateManager" && assignment.Site!.GovernorateId != _currentUser.GovernorateId)
            return Forbid();

        var oldEndDate = assignment.EndDate;
        assignment.EndDate   = req.EndDate;
        assignment.Notes     = req.Notes;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UpdateEndDate", "Assignment", id, null, new { req.EndDate, req.Notes });

        // 🔔 إشعار المفتش بتعديل مدة التعيين
        var newDateText = req.EndDate.HasValue
            ? $"تم تعديل مدة تعيينك على موقع '{assignment.Site!.Name}' — الفترة الجديدة: من {assignment.Date:d/M/yyyy} إلى {req.EndDate:d/M/yyyy}."
            : $"تم إلغاء تاريخ انتهاء تعيينك على موقع '{assignment.Site!.Name}' — أصبح التعيين مفتوح المدة.";
        await SendInspectorNotification(
            inspectorId:  assignment.InspectorId,
            siteId:       assignment.SiteId,
            senderUserId: _currentUser.UserId,
            message:      $"🔄 {newDateText}"
        );

        return Ok(new { message = "تم تحديث تاريخ انتهاء التعيين" });
    }

    // ---- Transfer Requests ---------------------------------

    /// <summary>List transfer requests for current manager.</summary>
    [HttpGet("transfer-requests")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetTransferRequests()
    {
        var role = _currentUser.Role;
        var query = _db.AssignmentTransferRequests
            .Include(r => r.Inspector)
            .Include(r => r.TargetSite)
            .Include(r => r.FromGovernorate)
            .Include(r => r.ToGovernorate)
            .AsQueryable();

        if (role == "GovernorateManager")
        {
            if (_currentUser.GovernorateId is null) return Forbid();
            var govId = _currentUser.GovernorateId.Value;
            query = query.Where(r => r.FromGovernorateId == govId || r.ToGovernorateId == govId);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                InspectorName = r.Inspector!.Name,
                FromGovernorate = r.FromGovernorate!.Name,
                ToGovernorate = r.ToGovernorate!.Name,
                TargetSiteName = r.TargetSite!.Name,
                r.EffectiveDate,
                Status = r.Status.ToString(),
                IsIncoming = role == "GovernorateManager" && r.FromGovernorateId == _currentUser.GovernorateId,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    /// <summary>Destination manager: initiate cross-governorate transfer.</summary>
    [HttpPost("transfer-requests")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> InitiateTransfer([FromBody] CreateTransferRequest request)
    {
        if (_currentUser.GovernorateId is null) return Forbid();

        // Inspector must currently be assigned to a different governorate
        var inspector = await _db.Users.FindAsync(request.InspectorId);
        if (inspector is null) return NotFound();
        if (inspector.GovernorateId == _currentUser.GovernorateId)
            return BadRequest(new { message = "المفتش ينتمي لنفس المحافظة بالفعل" });

        var transferReq = new AssignmentTransferRequest
        {
            Id = Guid.NewGuid(),
            InspectorId = request.InspectorId,
            FromGovernorateId = inspector.GovernorateId ?? Guid.Empty,
            ToGovernorateId = _currentUser.GovernorateId.Value,
            TargetSiteId = request.TargetSiteId,
            TargetShiftId = request.TargetShiftId,
            RequestedById = _currentUser.UserId,
            EffectiveDate = request.EffectiveDate
        };

        _db.AssignmentTransferRequests.Add(transferReq);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("TransferRequest", "AssignmentTransferRequest", transferReq.Id);

        // 🔔 Notify the inspector about the transfer request
        var toGov = await _db.Governorates.FindAsync(_currentUser.GovernorateId);
        await SendInspectorNotification(
            inspectorId:  request.InspectorId,
            siteId:       request.TargetSiteId,
            senderUserId: _currentUser.UserId,
            message:      $"📋 تم تقديم طلب ندب إلى محافظة {toGov?.Name ?? "جديدة"} — اعتباراً من {request.EffectiveDate:d/M/yyyy}. بانتظار موافقة محافظتك الحالية."
        );

        return Ok(new { message = "تم إرسال طلب النقل لمسؤول المحافظة المصدر للموافقة" });
    }

    /// <summary>Source manager: approve transfer.</summary>
    [HttpPost("transfer-requests/{id:guid}/approve")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> ApproveTransfer(Guid id, [FromBody] ApproveRejectTransferRequest body)
    {
        var req = await _db.AssignmentTransferRequests.FindAsync(id);
        if (req is null) return NotFound();

        // المراقبون وما فوقهم يوافقون مباشرة بدون قيد المحافظة
        var isPrivileged = _currentUser.Role is "Monitor" or "GeneralMonitor" or "Admin";
        if (!isPrivileged && req.FromGovernorateId != _currentUser.GovernorateId)
            return Forbid();

        if (req.Status != RequestStatus.Pending) return BadRequest(new { message = "تم معالجة الطلب مسبقاً" });

        // Deactivate old assignment on effective date
        var oldAssignment = await _db.InspectorAssignments
            .FirstOrDefaultAsync(a => a.InspectorId == req.InspectorId && a.Date >= req.EffectiveDate && a.IsActive);
        if (oldAssignment is not null)
        {
            oldAssignment.IsActive = false;
            oldAssignment.AssignmentStatus = AssignmentStatus.Replaced;
        }

        // Create new assignment
        var newAssignment = new InspectorAssignment
        {
            Id = Guid.NewGuid(),
            InspectorId = req.InspectorId,
            SiteId = req.TargetSiteId,
            ShiftId = req.TargetShiftId,
            Date = req.EffectiveDate
        };
        _db.InspectorAssignments.Add(newAssignment);

        req.Status = RequestStatus.Approved;
        req.ApprovedById = _currentUser.UserId;
        req.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("ApproveTransfer", "AssignmentTransferRequest", id);

        // 🔔 Notify inspector: transfer approved
        var targetSite = await _db.StorageSites.Include(s => s.Governorate).FirstOrDefaultAsync(s => s.Id == req.TargetSiteId);
        await SendInspectorNotification(
            inspectorId:  req.InspectorId,
            siteId:       req.TargetSiteId,
            senderUserId: _currentUser.UserId,
            message:      $"✅ تمت الموافقة على ندبك إلى موقع '{targetSite?.Name ?? "الموقع الجديد"}' في محافظة {targetSite?.Governorate?.Name ?? ""}. تاريخ بدء العمل: {req.EffectiveDate:d/M/yyyy}."
        );

        return Ok(new { message = "تم اعتماد النقل وتفعيل التعيين الجديد" });
    }

    /// <summary>Source manager: reject transfer.</summary>
    [HttpPost("transfer-requests/{id:guid}/reject")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> RejectTransfer(Guid id, [FromBody] ApproveRejectTransferRequest body)
    {
        var req = await _db.AssignmentTransferRequests.FindAsync(id);
        if (req is null) return NotFound();

        // المراقبون وما فوقهم يرفضون مباشرة بدون قيد المحافظة
        var isPrivileged = _currentUser.Role is "Monitor" or "GeneralMonitor" or "Admin";
        if (!isPrivileged && req.FromGovernorateId != _currentUser.GovernorateId)
            return Forbid();

        if (req.Status != RequestStatus.Pending) return BadRequest(new { message = "تم معالجة الطلب مسبقاً" });

        req.Status = RequestStatus.Rejected;
        req.RejectionReason = body.Reason;
        req.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("RejectTransfer", "AssignmentTransferRequest", id);

        // 🔔 Notify inspector: transfer rejected
        await SendInspectorNotification(
            inspectorId:  req.InspectorId,
            siteId:       req.TargetSiteId,
            senderUserId: _currentUser.UserId,
            message:      $"❌ تم رفض طلب ندبك.{(string.IsNullOrEmpty(body.Reason) ? "" : " السبب: " + body.Reason)} يمكنك التواصل مع مسؤولك المباشر للاستفسار."
        );

        return Ok(new { message = "تم رفض طلب النقل" });
    }

    private static AssignmentDto MapDto(InspectorAssignment a)
    {
        var outKg = a.Site?.TransfersOut?.Sum(t => t.TransferQtyKg) ?? 0;
        return new AssignmentDto(
            a.Id, a.InspectorId, a.Inspector?.Name ?? "",
            a.SiteId, a.Site?.Name ?? "",
            a.Site?.Governorate?.Name ?? "",
            a.Site?.District?.Name ?? "",
            a.ShiftId, a.Shift?.Name,
            a.Date, a.EndDate, a.Notes,
            a.AssignmentStatus, a.IsActive,
            a.Site?.CapacityKg ?? 0,
            a.Site?.CurrentStockKg ?? 0,
            a.Site?.TotalReceivedKg ?? 0,
            outKg
        );
    }

    /// <summary>
    /// Sends a system notification to the inspector via InspectorMessage.
    /// </summary>
    private async Task SendInspectorNotification(Guid inspectorId, Guid siteId, Guid senderUserId, string message)
    {
        _db.InspectorMessages.Add(new Domain.Entities.InspectorMessage
        {
            Id                  = Guid.NewGuid(),
            SenderUserId        = senderUserId,
            RecipientInspectorId = inspectorId,
            SiteId              = siteId,
            Message             = message,
            IsRead              = false,
            CreatedAt           = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
    }
}

public record UpdateEndDateRequest(DateOnly? EndDate, string? Notes);
