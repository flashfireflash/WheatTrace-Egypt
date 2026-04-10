using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Application.Common.DTOs.StorageSites;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/storage-sites")]
[Authorize]
public class StorageSitesController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _cu;
    private readonly IAuditService _audit;

    public StorageSitesController(WheatTraceDbContext db, ICurrentUserService cu, IAuditService audit)
    {
        _db = db; _cu = cu; _audit = audit;
    }

    /// <summary>إرجاع قائمة بكافة مواقع التخزين مع توضيح نسبة الإشغال والحالة الأخيرة للموقع (مفتوح، مغلق). مقيدة بصلاحيات المحافظة آلياً.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StorageSiteDto>>> List(
        [FromQuery] Guid? governorateId,
        [FromQuery] Guid? authorityId,
        [FromQuery] string? status)
    {
        var q = _db.StorageSites
            .Include(s => s.Governorate)
            .Include(s => s.District)
            .Include(s => s.Authority)
            .Include(s => s.DailyEntries.Where(d => d.Date == DateOnly.FromDateTime(DateTime.Today)))
            .AsQueryable();

        // Go-manager sees only their governorate
        if (_cu.Role == "GovernorateManager" && _cu.GovernorateId.HasValue)
            q = q.Where(s => s.GovernorateId == _cu.GovernorateId);

        if (governorateId.HasValue) q = q.Where(s => s.GovernorateId == governorateId);
        if (authorityId.HasValue)   q = q.Where(s => s.AuthorityId == authorityId);
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<SiteStatus>(status, out var st))
            q = q.Where(s => s.Status == st);

        var sites = await q.OrderBy(s => s.Governorate!.Name).ThenBy(s => s.Name).ToListAsync();
        return Ok(sites.Select(MapDto));
    }

    /// <summary>جلب تفاصيل موقع تخزيني محدد بناءً على معرفه (ID) مع إحصائيات السعة وحركات النقل.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var site = await _db.StorageSites
            .Include(s => s.Governorate)
            .Include(s => s.District)
            .Include(s => s.Authority)
            .Include(s => s.LifecycleEvents.OrderByDescending(e => e.EventDate))
            .FirstOrDefaultAsync(s => s.Id == id);

        if (site is null) return NotFound();

        // Transfer totals
        var outKg = await _db.StockTransfers.Where(t => t.FromSiteId == id).SumAsync(t => (long?)t.TransferQtyKg) ?? 0;
        var inKg  = await _db.StockTransfers.Where(t => t.ToSiteId   == id).SumAsync(t => (long?)t.TransferQtyKg) ?? 0;

        return Ok(new
        {
            site = MapDto(site),
            TotalReceivedKg    = site.TotalReceivedKg,
            TransferredOutKg   = outKg,
            TransferredInKg    = inKg,
            NetCurrentStockKg  = site.CurrentStockKg,
            LifecycleHistory   = site.LifecycleEvents.Select(e => new
            {
                e.Id, e.EventType, e.EventDate, e.Reason, e.StockSnapshotKg
            }),
        });
    }

    // ====== Admin CRUD ======
    
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Create([FromBody] CreateStorageSiteRequest req)
    {
        var site = new StorageSite
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            GovernorateId = req.GovernorateId,
            DistrictId = req.DistrictId,
            AuthorityId = req.AuthorityId,
            CapacityKg = req.CapacityKg,
            Status = SiteStatus.Active,
            IsShiftEnabled = req.IsShiftEnabled,
            Latitude = req.Latitude,
            Longitude = req.Longitude,
            LocationText = req.LocationText,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.StorageSites.Add(site);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Create", "StorageSite", site.Id);

        return Ok(MapDto(site));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateStorageSiteRequest req)
    {
        var site = await _db.StorageSites.FindAsync(id);
        if (site is null) return NotFound(new { message = "الموقع غير موجود" });

        if (req.CapacityKg < site.CurrentStockKg)
            return BadRequest(new { message = "السعة الجديدة أقل من القمح المخزن حالياً." });

        site.Name = req.Name;
        site.GovernorateId = req.GovernorateId;
        site.DistrictId = req.DistrictId;
        if (req.AuthorityId.HasValue) site.AuthorityId = req.AuthorityId.Value;
        site.CapacityKg = req.CapacityKg;
        site.IsShiftEnabled = req.IsShiftEnabled;
        site.ExceptionStartDate = req.ExceptionStartDate;
        site.ExceptionEndDate = req.ExceptionEndDate;
        site.Latitude = req.Latitude;
        site.Longitude = req.Longitude;
        site.LocationText = req.LocationText;
        site.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapDto(site));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var site = await _db.StorageSites
            .Include(s => s.DailyEntries)
            .FirstOrDefaultAsync(s => s.Id == id);
            
        if (site is null) return NotFound(new { message = "الموقع غير موجود" });

        var hasAssignments = await _db.InspectorAssignments.AnyAsync(a => a.SiteId == id);

        if (site.DailyEntries.Any() || hasAssignments)
            return BadRequest(new { message = "لا يمكن حذف الموقع لارتباطه بسجلات مسجلة أو تعيينات." });

        _db.StorageSites.Remove(site);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم الحذف بنجاح" });
    }

    // ====== Lifecycle Events ======

    /// <summary>
    /// Open or reopen a site.
    /// Allowed when site Status = Closed/Suspended.
    /// Records a 'Opened' or 'Resumed' lifecycle event.
    /// </summary>
    [HttpPost("{id:guid}/open")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> OpenSite(Guid id, [FromBody] SiteLifecycleRequest request)
    {
        var site = await _db.StorageSites.FindAsync(id);
        if (site is null) return NotFound();
        if (site.Status == SiteStatus.Active)
            return BadRequest(new { message = "الموقع مفتوح بالفعل" });

        var evt = new SiteLifecycleEvent
        {
            SiteId = id,
            EventType = site.Status == SiteStatus.Suspended ? SiteEventType.Resumed : SiteEventType.Opened,
            EventDate = request.EventDate,
            Reason = request.Reason,
            RecordedById = _cu.UserId,
            StockSnapshotKg = site.CurrentStockKg
        };

        site.Status = SiteStatus.Active;
        site.UpdatedAt = DateTime.UtcNow;

        _db.SiteLifecycleEvents.Add(evt);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Open", "StorageSite", id, newValues: new { evt.EventType, evt.EventDate });

        await NotifySiteInspectors(id, $"📢 تم {((site.Status == SiteStatus.Suspended) ? "استئناف" : "افتتاح")} العمل بموقع '{site.Name}' اعتباراً من {evt.EventDate:yyyy-MM-dd}. برجاء التوجه لمقر العمل لاستئناف الاستلام.");

        return Ok(new { message = "تم فتح الموقع التخزيني", eventType = evt.EventType.ToString() });
    }

    /// <summary>
    /// Close a site with a reason.
    /// Records a 'Closed' lifecycle event with a stock snapshot.
    /// The site can still be re-opened — NO data is deleted.
    /// </summary>
    [HttpPost("{id:guid}/close")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> CloseSite(Guid id, [FromBody] SiteLifecycleRequest request)
    {
        var site = await _db.StorageSites.FindAsync(id);
        if (site is null) return NotFound();
        if (site.Status == SiteStatus.Closed)
            return BadRequest(new { message = "الموقع مغلق بالفعل" });

        var evt = new SiteLifecycleEvent
        {
            SiteId = id,
            EventType = SiteEventType.Closed,
            EventDate = request.EventDate,
            Reason = request.Reason,  // e.g. "اكتملت الطاقة التخزينية"
            RecordedById = _cu.UserId,
            StockSnapshotKg = site.CurrentStockKg  // snapshot of stock at closure time
        };

        site.Status = SiteStatus.Closed;
        site.UpdatedAt = DateTime.UtcNow;

        _db.SiteLifecycleEvents.Add(evt);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("Close", "StorageSite", id, newValues: new { evt.EventDate, evt.Reason, StockAtClose = site.CurrentStockKg });

        await NotifySiteInspectors(id, $"🛑 تم التوجيه بإغلاق موقع '{site.Name}' اعتباراً من {evt.EventDate:yyyy-MM-dd} لسبب: {request.Reason}. برجاء إيقاف الاستلام والتأكد من مطابقة الأرصدة.");

        return Ok(new
        {
            message = "تم إغلاق الموقع التخزيني",
            stockAtClose = site.CurrentStockKg,
            hint = site.CurrentStockKg > 0
                ? $"يوجد {site.CurrentStockKg / 1000} طن {site.CurrentStockKg % 1000} كجم في الموقع — يمكن نقلها لموقع آخر."
                : "الموقع فارغ."
        });
    }

    // ====== Stock Transfers ======

    /// <summary>
    /// Transfer stock from this site to another.
    ///
    /// Business rules:
    ///   1. Source site must be Closed or Suspended (usually transferred after closure).
    ///   2. Source current_stock_kg >= transfer_qty_kg.
    ///   3. Destination current_stock_kg + transfer_qty_kg <= destination capacity_kg.
    ///   4. Daily entries are NEVER modified — this is a separate ledger entry.
    ///   5. total_received_kg on source is NOT touched (permanent audit total).
    /// </summary>
    [HttpPost("{id:guid}/transfers")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> TransferStock(Guid id, [FromBody] CreateStockTransferRequest request)
    {
        if (request.ToSiteId.HasValue && id == request.ToSiteId.Value)
            return BadRequest(new { message = "لا يمكن النقل من وإلى نفس الموقع" });

        if (!request.ToSiteId.HasValue && string.IsNullOrWhiteSpace(request.ExternalDestination))
            return BadRequest(new { message = "يجب تحديد الموقع الهدف أو كتابة وجهة الصرف الخارجية (مثل المطحن)" });

        await using var tx = await _db.Database.BeginTransactionAsync();

        // Pessimistic lock on source site
        var fromSite = await _db.StorageSites
            .FromSqlRaw("SELECT * FROM storage_sites WHERE id = {0} FOR UPDATE", id)
            .FirstOrDefaultAsync();

        if (fromSite is null) return NotFound(new { message = "الموقع المصدر غير موجود" });

        StorageSite? toSite = null;
        if (request.ToSiteId.HasValue)
        {
            toSite = await _db.StorageSites
                .FromSqlRaw("SELECT * FROM storage_sites WHERE id = {0} FOR UPDATE", request.ToSiteId.Value)
                .FirstOrDefaultAsync();

            if (toSite is null) return NotFound(new { message = "الموقع الهدف غير موجود" });
        }

        // Rule 2: sufficient stock at source
        if (fromSite.CurrentStockKg < request.TransferQtyKg)
            return BadRequest(new {
                message = $"الكمية المطلوب نقلها ({request.TransferQtyKg / 1000} طن) أكبر من الرصيد الحالي ({fromSite.CurrentStockKg / 1000} طن)",
                availableKg = fromSite.CurrentStockKg
            });

        // Rule 3: capacity check on destination (if transferring to another site)
        if (toSite != null && toSite.CurrentStockKg + request.TransferQtyKg > toSite.CapacityKg)
            return BadRequest(new {
                message = $"الموقع الهدف لا يتسع للكمية. المتاح: {(toSite.CapacityKg - toSite.CurrentStockKg) / 1000} طن",
                availableCapacityKg = toSite.CapacityKg - toSite.CurrentStockKg
            });

        // Create transfer record
        var transfer = new StockTransfer
        {
            FromSiteId          = id,
            ToSiteId            = request.ToSiteId,
            ExternalDestination = request.ExternalDestination,
            TransferQtyKg       = request.TransferQtyKg,
            Wheat22_5Ton        = request.Wheat22_5?.Ton    ?? 0,
            Wheat22_5Kg         = request.Wheat22_5?.Kg     ?? 0,
            Wheat23Ton          = request.Wheat23?.Ton      ?? 0,
            Wheat23Kg           = request.Wheat23?.Kg       ?? 0,
            Wheat23_5Ton        = request.Wheat23_5?.Ton    ?? 0,
            Wheat23_5Kg         = request.Wheat23_5?.Kg     ?? 0,
            TransferDate        = request.TransferDate,
            Reason              = request.Reason,
            VehicleInfo         = request.VehicleInfo,
            AuthorizedById      = _cu.UserId,
            TriggerEventId      = request.TriggerEventId
        };

        // Adjust current stock (total_received_kg stays unchanged)
        fromSite.CurrentStockKg -= request.TransferQtyKg;
        fromSite.UpdatedAt = DateTime.UtcNow;

        if (toSite != null)
        {
            toSite.CurrentStockKg += request.TransferQtyKg;
            toSite.UpdatedAt = DateTime.UtcNow;
        }

        _db.StockTransfers.Add(transfer);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        await _audit.LogAsync("StockTransfer", "StockTransfer", transfer.Id, newValues: new
        {
            FromSite = fromSite.Name,
            ToSite = toSite?.Name ?? request.ExternalDestination,
            TransferKg = transfer.TransferQtyKg
        });

        return Ok(new
        {
            message     = $"تم النقل / الصرف لـ {toSite?.Name ?? request.ExternalDestination} بكمية {transfer.TransferQtyKg / 1000} طن {transfer.TransferQtyKg % 1000} كجم بنجاح",
            transferId  = transfer.Id,
            fromRemaining = fromSite.CurrentStockKg,
            toNewStock  = toSite?.CurrentStockKg
        });
    }

    /// <summary>List all transfer history for a site (in or out).</summary>
    [HttpGet("{id:guid}/transfers")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetTransferHistory(Guid id)
    {
        var out_ = await _db.StockTransfers
            .Include(t => t.ToSite)
            .Include(t => t.AuthorizedBy)
            .Where(t => t.FromSiteId == id)
            .OrderByDescending(t => t.TransferDate)
            .Select(t => new {
                t.Id, Direction = "خارج",
                OtherSite = t.ToSite != null ? t.ToSite.Name : (t.ExternalDestination ?? "جهة خارجية"),
                t.TransferQtyKg,
                TonDisplay = $"{t.TransferQtyKg / 1000} طن {(t.TransferQtyKg % 1000).ToString().PadLeft(3, '0')} كجم",
                t.TransferDate, t.Reason, t.VehicleInfo,
                Authorized = t.AuthorizedBy!.Name
            })
            .ToListAsync();

        var in_ = await _db.StockTransfers
            .Include(t => t.FromSite)
            .Include(t => t.AuthorizedBy)
            .Where(t => t.ToSiteId == id)
            .OrderByDescending(t => t.TransferDate)
            .Select(t => new {
                t.Id, Direction = "داخل",
                OtherSite = t.FromSite!.Name,
                t.TransferQtyKg,
                TonDisplay = $"{t.TransferQtyKg / 1000} طن {t.TransferQtyKg % 1000} كجم",
                t.TransferDate, t.Reason, t.VehicleInfo,
                Authorized = t.AuthorizedBy!.Name
            })
            .ToListAsync();

        return Ok(new
        {
            transfersOut  = out_,
            transfersIn   = in_,
            totalOutKg    = out_.Sum(t => t.TransferQtyKg),
            totalInKg     = in_.Sum(t => t.TransferQtyKg)
        });
    }

    // ---- Helper ---------------------------------------------------
    private static StorageSiteDto MapDto(StorageSite s)
    {
        var pct = s.CapacityKg > 0 ? (decimal)s.CurrentStockKg / s.CapacityKg * 100 : 0;
        var color = pct >= 90 ? "danger" : pct >= 75 ? "warning" : "ok";

        return new StorageSiteDto(
            s.Id, s.Name,
            s.Governorate?.Name ?? "",
            s.District?.Name ?? "",
            s.Authority?.Name ?? "",
            s.CapacityKg, s.CurrentStockKg, pct, color,
            s.Status.ToString(), s.IsShiftEnabled,
            s.ExceptionStartDate?.ToString("yyyy-MM-dd"),
            s.ExceptionEndDate?.ToString("yyyy-MM-dd"),
            s.Latitude, s.Longitude,
            s.LocationText,
            s.DailyEntries?.Any(d => d.Date == DateOnly.FromDateTime(DateTime.Today)) ?? false
        );
    }

    private async Task NotifySiteInspectors(Guid siteId, string message)
    {
        // Find all inspectors that ever worked or are assigned currently to this site today or in the future.
        // Actually, just find anyone assigned to this site today or in the future
        var today = DateOnly.FromDateTime(DateTime.Today);
        var activeInspectorIds = await _db.InspectorAssignments
            .Where(a => a.SiteId == siteId && a.EndDate >= today)
            .Select(a => a.InspectorId)
            .Distinct()
            .ToListAsync();

        var messages = activeInspectorIds.Select(inspectorId => new Domain.Entities.InspectorMessage
        {
            Id = Guid.NewGuid(),
            SenderUserId = _cu.UserId,
            RecipientInspectorId = inspectorId,
            SiteId = siteId,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        if (messages.Any())
        {
            _db.InspectorMessages.AddRange(messages);
            await _db.SaveChangesAsync();
        }
    }
}

public record CreateStorageSiteRequest(
    string Name,
    Guid GovernorateId,
    Guid? DistrictId,
    Guid AuthorityId,
    long CapacityKg,
    bool IsShiftEnabled,
    double? Latitude,
    double? Longitude,
    string? LocationText = null
);

public record UpdateStorageSiteRequest(
    string Name,
    Guid GovernorateId,
    Guid? DistrictId,
    Guid? AuthorityId,
    long CapacityKg,
    bool IsShiftEnabled,
    DateOnly? ExceptionStartDate,
    DateOnly? ExceptionEndDate,
    double? Latitude,
    double? Longitude,
    string? LocationText = null
);
