using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _cu;

    public ReportsController(WheatTraceDbContext db, ICurrentUserService cu)
    {
        _db = db;
        _cu = cu;
    }

    /// <summary>
    /// ملخص يومي مجمع: إجمالي الأطنان والكيلوجرامات والمرفوضات لتاريخ محدد.
    /// يُطبق نطاق المحافظة تلقائياً لمدير المحافظة ومراقب العمليات (RBAC).
    /// </summary>
    [HttpGet("daily-summary")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetDailySummary([FromQuery] string? date)
    {
        var targetDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.UtcNow);

        var query = _db.DailyEntries
            .Include(e => e.Site)
            .Where(e => e.Date == targetDate)
            .AsQueryable();

        // تصفية نطاق المحافظة لمدير المحافظة ومراقب العمليات
        if ((_cu.Role == "GovernorateManager") && _cu.GovernorateId.HasValue)
        {
            query = query.Where(e => e.Site!.GovernorateId == _cu.GovernorateId);
        }

        var entries = await query.ToListAsync();

        var totalKg = entries.Sum(e => (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg
                                     + (long)e.Wheat23Ton * 1000 + e.Wheat23Kg
                                     + (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg);

        var subtotalTon = totalKg / 1000;
        var subtotalKg  = totalKg % 1000;

        var entryIds = entries.Select(e => e.Id).ToList();
        var totalRejectionsTon = await _db.Rejections
            .Where(r => entryIds.Contains(r.DailyEntryId))
            .SumAsync(r => r.TotalRejectionTon);

        return Ok(new
        {
            date = targetDate,
            subtotalTon,
            subtotalKg,
            totalRejectionsTon,
            entryCount = entries.Count
        });
    }

    [AllowAnonymous]
    [HttpGet("fix-totals")]
    public async Task<ActionResult> FixTotals()
    {
        var sites = await _db.StorageSites.Include(s => s.DailyEntries).ToListAsync();
        int fixedCount = 0;
        int deletedDuplicates = 0;

        foreach(var s in sites)
        {
            if (s.Name == "مركز تجميع صومعة الخارجة" && s.DailyEntries.Any())
            {
                // Delete duplicate records inserted by SQL due to LIKE '%الخارجة%'
                var toDelete = s.DailyEntries.ToList();
                _db.DailyEntries.RemoveRange(toDelete);
                s.TotalReceivedKg = 0;
                s.CurrentStockKg = 0;
                deletedDuplicates += toDelete.Count;
                fixedCount++;
                continue;
            }

            long trueSum = s.DailyEntries.Sum(e => 
                (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg + 
                (long)e.Wheat23Ton * 1000 + e.Wheat23Kg + 
                (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg);

            if (s.TotalReceivedKg != trueSum || s.CurrentStockKg != trueSum)
            {
                s.TotalReceivedKg = trueSum;
                s.CurrentStockKg = trueSum; // Assuming no outbound transfers
                fixedCount++;
            }
        }

        if (fixedCount > 0 || deletedDuplicates > 0)
        {
            await _db.SaveChangesAsync();
        }

        return Ok(new { fixedCount, deletedDuplicates, message = "Databases synchronized" });
    }

    [AllowAnonymous]
    [HttpGet("fix-kharga-db")]
    public async Task<ActionResult> FixKhargaDb()
    {
        var sites = await _db.StorageSites.Include(s => s.DailyEntries).ToListAsync();
        int fixedCount = 0;
        int deletedDuplicates = 0;

        foreach(var s in sites)
        {
            if (s.Name == "مركز تجميع صومعة الخارجة" && s.DailyEntries.Any())
            {
                var toDelete = s.DailyEntries.ToList();
                _db.DailyEntries.RemoveRange(toDelete);
                s.TotalReceivedKg = 0;
                s.CurrentStockKg = 0;
                deletedDuplicates += toDelete.Count;
                fixedCount++;
                continue;
            }
            long trueSum = s.DailyEntries.Sum(e => 
                (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg + 
                (long)e.Wheat23Ton * 1000 + e.Wheat23Kg + 
                (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg);

            if (s.TotalReceivedKg != trueSum || s.CurrentStockKg != trueSum)
            {
                s.TotalReceivedKg = trueSum;
                s.CurrentStockKg = trueSum;
                fixedCount++;
            }
        }
        await _db.SaveChangesAsync();
        return Ok(new { fixedCount, deletedDuplicates, message = "Prod DB fully synchronized" });
    }

    [AllowAnonymous]
    [HttpGet("debug-wadi")]
    public async Task<ActionResult> DebugWadi()
    {
        var dbSites = await _db.StorageSites.Include(s => s.Governorate)
            .Where(s => s.Governorate.Name == "الوادي الجديد" || s.Governorate.Name.Contains("الواد"))
            .Select(s => new {
                s.Id, s.Name, s.TotalReceivedKg,
                EntriesSum = s.DailyEntries.Sum(e => 
                    (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg + 
                    (long)e.Wheat23Ton * 1000 + e.Wheat23Kg + 
                    (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg)
            })
            .ToListAsync();
            
        return Ok(dbSites);
    }

    /// <summary>
    /// تقرير التوريد اليومي التفصيلي خلال فترة زمنية: يُعيد صفاً لكل يوم مع كميات كل موقع والمرفوضات.
    /// RBAC: المفتش <- ادخالاته | مدير/مراقب المحافظة <- محافظتهم | النظام <- الكل.
    /// </summary>
    [HttpGet("daily-breakdown")]
    [Authorize(Policy = "InspectorOrAbove")]
    public async Task<ActionResult> GetDailyBreakdown(
        [FromQuery] string startDate,
        [FromQuery] string endDate,
        [FromQuery] Guid? siteId,
        [FromQuery] Guid? governorateId,
        [FromQuery] Guid? authorityId)
    {
        if (!DateOnly.TryParse(startDate, out var sd)) return BadRequest("startDate invalid");
        if (!DateOnly.TryParse(endDate,   out var ed)) return BadRequest("endDate invalid");

        var query = _db.DailyEntries
            .Include(e => e.Site!.Governorate)
            .Include(e => e.Site!.Authority)
            .Include(e => e.Inspector)
            .Where(e => e.Date >= sd && e.Date <= ed)
            .AsQueryable();

        if (_cu.Role == "Inspector")
            query = query.Where(e => e.InspectorId == _cu.UserId);
        else if ((_cu.Role == "GovernorateManager") && _cu.GovernorateId.HasValue)
            query = query.Where(e => e.Site!.GovernorateId == _cu.GovernorateId);

        if (siteId.HasValue)        query = query.Where(e => e.SiteId == siteId.Value);
        if (governorateId.HasValue) query = query.Where(e => e.Site!.GovernorateId == governorateId.Value);
        if (authorityId.HasValue)   query = query.Where(e => e.Site!.AuthorityId == authorityId.Value);

        var entries = await query.OrderBy(e => e.Date).ToListAsync();

        var entryIds2 = entries.Select(e => e.Id).ToList();
        var rejections2 = await _db.Rejections
            .Where(r => entryIds2.Contains(r.DailyEntryId))
            .ToListAsync();
        var rejByEntry = rejections2.ToDictionary(r => r.DailyEntryId, r => r);

        var byDay = entries.GroupBy(e => e.Date).Select(dayGroup =>
        {
            var rows = dayGroup.Select(e =>
            {
                var rej = rejByEntry.TryGetValue(e.Id, out var r) ? r : null;
                var totalKgE = (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg
                             + (long)e.Wheat23Ton   * 1000 + e.Wheat23Kg
                             + (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg;
                return new
                {
                    SiteId = e.SiteId, SiteName = e.Site!.Name,
                    Governorate   = e.Site.Governorate?.Name ?? "---",
                    Authority     = e.Site.Authority?.Name  ?? "---",
                    InspectorName = e.Inspector?.Name ?? "---",
                    W22_5Ton = e.Wheat22_5Ton, W22_5Kg = e.Wheat22_5Kg,
                    W23Ton   = e.Wheat23Ton,   W23Kg   = e.Wheat23Kg,
                    W23_5Ton = e.Wheat23_5Ton, W23_5Kg = e.Wheat23_5Kg,
                    TotalTon = totalKgE / 1000, TotalKg = totalKgE % 1000,
                    RejectedTon = rej?.TotalRejectionTon ?? 0m,
                    IsTreated   = (rej?.TreatedQuantityTon ?? 0) > 0,
                    TreatedTon  = rej?.TreatedQuantityTon ?? 0m,
                };
            }).ToList();
            var dayKg = dayGroup.Sum(e =>
                (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg +
                (long)e.Wheat23Ton   * 1000 + e.Wheat23Kg   +
                (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg);
            return new
            {
                Date = dayGroup.Key, Rows = rows,
                DayTotalTon = dayKg / 1000, DayTotalKg = dayKg % 1000,
                DayRejectedTon = rows.Sum(rw => rw.RejectedTon), EntryCount = rows.Count,
            };
        }).ToList();

        var grandKg = entries.Sum(e =>
            (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg +
            (long)e.Wheat23Ton   * 1000 + e.Wheat23Kg   +
            (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg);

        return Ok(new
        {
            Days = byDay,
            GrandTotalTon = grandKg / 1000, GrandTotalKg = grandKg % 1000,
            GrandRejectedTon = rejections2.Sum(r => r.TotalRejectionTon),
            TotalDays = byDay.Count, TotalEntries = entries.Count,
        });
    }

    /// <summary>
    /// البنية الهرمية: محافظة -> جهة تسويقية -> مواقع
    /// مع إجماليات الأطنان ودرجات القمح والمرفوضات.
    /// يدعم تصفية نطاق زمني (startDate / endDate).
    /// </summary>
    [HttpGet("detailed-totals")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetDetailedTotals(
        [FromQuery] Guid? governorateId,
        [FromQuery] Guid? authorityId,
        [FromQuery] Guid? siteId,
        [FromQuery] string? startDate,
        [FromQuery] string? endDate)
    {
        DateOnly? sd = DateOnly.TryParse(startDate, out var parsedSd) ? parsedSd : null;
        DateOnly? ed = DateOnly.TryParse(endDate, out var parsedEd) ? parsedEd : null;

        var query = _db.StorageSites
            .Include(s => s.Governorate)
            .Include(s => s.Authority)
            .Include(s => s.DailyEntries)
            .Include(s => s.LifecycleEvents)
            .AsQueryable();

        // RBAC: تصفية نطاق المحافظة
        if ((_cu.Role == "GovernorateManager") && _cu.GovernorateId.HasValue)
        {
            query = query.Where(s => s.GovernorateId == _cu.GovernorateId);
        }

        if (governorateId.HasValue) query = query.Where(s => s.GovernorateId == governorateId.Value);
        if (authorityId.HasValue)   query = query.Where(s => s.AuthorityId == authorityId.Value);
        if (siteId.HasValue)        query = query.Where(s => s.Id == siteId.Value);

        // بناء الهرم: محافظة -> جهة -> مواقع
        var resultRows = await query.Select(s => new
        {
            s.Id,
            SiteName = s.Name,
            GovernorateName = s.Governorate!.Name,
            AuthorityName = s.Authority!.Name,
            s.Status,
            s.CapacityKg,
            s.CurrentStockKg,
            s.TotalReceivedKg,
            W225Sum = s.DailyEntries
                .Where(e => (!sd.HasValue || e.Date >= sd.Value) && (!ed.HasValue || e.Date <= ed.Value))
                .Sum(e => (long)e.Wheat22_5Ton * 1000 + e.Wheat22_5Kg),
            W23Sum = s.DailyEntries
                .Where(e => (!sd.HasValue || e.Date >= sd.Value) && (!ed.HasValue || e.Date <= ed.Value))
                .Sum(e => (long)e.Wheat23Ton * 1000 + e.Wheat23Kg),
            W235Sum = s.DailyEntries
                .Where(e => (!sd.HasValue || e.Date >= sd.Value) && (!ed.HasValue || e.Date <= ed.Value))
                .Sum(e => (long)e.Wheat23_5Ton * 1000 + e.Wheat23_5Kg),
            OpenDate = s.LifecycleEvents
                .Where(e => e.EventType == Domain.Enums.SiteEventType.Opened || e.EventType == Domain.Enums.SiteEventType.Resumed)
                .OrderByDescending(e => e.EventDate)
                .Select(e => (DateOnly?)e.EventDate)
                .FirstOrDefault(),
            CloseDate = s.LifecycleEvents
                .Where(e => e.EventType == Domain.Enums.SiteEventType.Closed || e.EventType == Domain.Enums.SiteEventType.Suspended)
                .OrderByDescending(e => e.EventDate)
                .Select(e => (DateOnly?)e.EventDate)
                .FirstOrDefault()
        }).ToListAsync();

        var siteIds = resultRows.Select(s => s.Id).ToList();
        
        var rejectionsBySite = await _db.Rejections
            .Where(r => siteIds.Contains(r.DailyEntry!.SiteId))
            .GroupBy(r => r.DailyEntry!.SiteId)
            .Select(g => new { SiteId = g.Key, TotalRej = g.Sum(r => r.TotalRejectionTon) })
            .ToDictionaryAsync(r => r.SiteId, r => r.TotalRej);

        var result = resultRows
            .GroupBy(s => s.GovernorateName ?? "بدون محافظة")
            .Select(govGroup => new
            {
                Governorate = govGroup.Key,
                Authorities = govGroup
                    .GroupBy(s => s.AuthorityName ?? "أخرى")
                    .Select(authGroup => new
                    {
                        Authority = authGroup.Key,
                        Sites = authGroup.Select(row =>
                        {
                            var rejectTon = rejectionsBySite.GetValueOrDefault(row.Id, 0);
                            var total = row.W225Sum + row.W23Sum + row.W235Sum;

                            return new
                            {
                                row.Id,
                                row.SiteName,
                                row.Status,
                                row.CapacityKg,
                                row.CurrentStockKg,
                                row.TotalReceivedKg,
                                W22_5Ton = row.W225Sum / 1000, W22_5Kg  = row.W225Sum % 1000,
                                W23Ton   = row.W23Sum  / 1000, W23Kg    = row.W23Sum  % 1000,
                                W23_5Ton = row.W235Sum / 1000, W23_5Kg  = row.W235Sum % 1000,
                                TotalTon = total / 1000, TotalKg  = total % 1000,
                                RejectedTon = rejectTon, RejectedKg = 0,
                                OpenDate  = row.OpenDate,
                                CloseDate = row.CloseDate
                            };
                        })
                    })
            });

        return Ok(result);
    }

    /// <summary>
    /// Inspector: Get their own quantities across a date range.
    /// </summary>
    [HttpGet("inspector/quantities")]
    [Authorize(Policy = "InspectorOrAbove")]
    public async Task<ActionResult> GetMyQuantities([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        var entries = await _db.DailyEntries
            .Include(e => e.Site)
            .Where(e => e.InspectorId == _cu.UserId && e.Date >= startDate && e.Date <= endDate)
            .ToListAsync();

        var sum225Ton = entries.Sum(e => e.Wheat22_5Ton);
        var sum225Kg  = entries.Sum(e => e.Wheat22_5Kg);
        var sum23Ton  = entries.Sum(e => e.Wheat23Ton);
        var sum23Kg   = entries.Sum(e => e.Wheat23Kg);
        var sum235Ton = entries.Sum(e => e.Wheat23_5Ton);
        var sum235Kg  = entries.Sum(e => e.Wheat23_5Kg);

        var totalTon = sum225Ton + sum23Ton + sum235Ton + (sum225Kg + sum23Kg + sum235Kg) / 1000M;

        return Ok(new
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalEntries = entries.Count,
            TotalQuantityTon = totalTon,
            Wheat22_5Ton = sum225Ton + sum225Kg / 1000M,
            Wheat23Ton   = sum23Ton  + sum23Kg  / 1000M,
            Wheat23_5Ton = sum235Ton + sum235Kg / 1000M,
            DailyBreakdown = entries.Select(e => new
            {
                e.Date,
                SiteName = e.Site?.Name,
                TotalTon = e.TotalQtyKg / 1000M
            }).OrderByDescending(e => e.Date)
        });
    }

    [HttpGet("site-aggregation/{siteId:guid}")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetSiteAggregation(Guid siteId)
    {
        var site = await _db.StorageSites.FindAsync(siteId);
        if (site == null) return NotFound();

        if (_cu.Role == "GovernorateManager" && _cu.GovernorateId.HasValue && site.GovernorateId != _cu.GovernorateId)
            return Forbid();

        var entries = await _db.DailyEntries
            .Where(e => e.SiteId == siteId)
            .ToListAsync();

        var sum225Ton = entries.Sum(e => e.Wheat22_5Ton) + entries.Sum(e => e.Wheat22_5Kg) / 1000M;
        var sum23Ton  = entries.Sum(e => e.Wheat23Ton)   + entries.Sum(e => e.Wheat23Kg)   / 1000M;
        var sum235Ton = entries.Sum(e => e.Wheat23_5Ton) + entries.Sum(e => e.Wheat23_5Kg) / 1000M;
        var totalTon  = sum225Ton + sum23Ton + sum235Ton;

        return Ok(new { SiteId = siteId, TotalQuantityTon = totalTon, Wheat22_5Ton = sum225Ton, Wheat23Ton = sum23Ton, Wheat23_5Ton = sum235Ton });
    }

    [HttpGet("inspector-days")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetInspectorDays(
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate,
        [FromQuery] Guid? governorateId,
        [FromQuery] Guid? authorityId,
        [FromQuery] Guid? siteId)
    {
        var query = _db.DailyEntries
            .Include(d => d.Inspector)
            .Include(d => d.Site).ThenInclude(s => s!.Governorate)
            .Include(d => d.Site).ThenInclude(s => s!.Authority)
            .AsQueryable();

        if (_cu.Role == "GovernorateManager" && _cu.GovernorateId.HasValue)
            query = query.Where(d => d.Site!.GovernorateId == _cu.GovernorateId);

        if (startDate.HasValue)       query = query.Where(d => d.Date >= startDate.Value);
        if (endDate.HasValue)         query = query.Where(d => d.Date <= endDate.Value);
        if (governorateId.HasValue)   query = query.Where(d => d.Site!.GovernorateId == governorateId.Value);
        if (authorityId.HasValue)     query = query.Where(d => d.Site!.AuthorityId == authorityId.Value);
        if (siteId.HasValue)          query = query.Where(d => d.SiteId == siteId.Value);

        var data = await query.Select(d => new
        {
            InspectorName   = d.Inspector!.Name,
            GovernorateName = d.Site!.Governorate!.Name,
            AuthorityName   = d.Site!.Authority!.Name,
            SiteName        = d.Site!.Name,
            Date            = d.Date,
            ShiftId         = d.ShiftId
        }).ToListAsync();

        return Ok(data);
    }

    [HttpGet("rejections-detailed")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetDetailedRejections(
        [FromQuery] DateOnly? startDate,
        [FromQuery] DateOnly? endDate,
        [FromQuery] Guid? governorateId,
        [FromQuery] Guid? authorityId,
        [FromQuery] Guid? siteId)
    {
        var query = _db.Rejections
            .Include(r => r.DailyEntry!.Site!.Governorate)
            .Include(r => r.DailyEntry!.Site!.Authority)
            .AsQueryable();

        if (_cu.Role == "GovernorateManager" && _cu.GovernorateId.HasValue)
            query = query.Where(r => r.DailyEntry!.Site!.GovernorateId == _cu.GovernorateId);

        if (startDate.HasValue)     query = query.Where(r => r.DailyEntry!.Date >= startDate.Value);
        if (endDate.HasValue)       query = query.Where(r => r.DailyEntry!.Date <= endDate.Value);
        if (governorateId.HasValue) query = query.Where(r => r.DailyEntry!.Site!.GovernorateId == governorateId.Value);
        if (authorityId.HasValue)   query = query.Where(r => r.DailyEntry!.Site!.AuthorityId == authorityId.Value);
        if (siteId.HasValue)        query = query.Where(r => r.DailyEntry!.SiteId == siteId.Value);

        var data = await query
            .OrderBy(r => r.DailyEntry!.Date)
            .Select(r => new
            {
                Date               = r.DailyEntry!.Date,
                SiteName           = r.DailyEntry!.Site!.Name,
                AuthorityName      = r.DailyEntry!.Site!.Authority!.Name,
                GovernorateName    = r.DailyEntry!.Site!.Governorate!.Name,
                TotalRejectionTon  = r.TotalRejectionTon,
                MoistureTon        = r.MoistureTon,
                SandGravelTon      = r.SandGravelTon,
                ImpuritiesTon      = r.ImpuritiesTon,
                InsectDamageTon    = r.InsectDamageTon,
                TreatedQuantityTon = r.TreatedQuantityTon
            }).ToListAsync();

        return Ok(data);
    }

    /// <summary>
    /// Returns current PostgreSQL database size in MB for storage monitoring.
    /// </summary>
    [HttpGet("db-size")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetDatabaseSize()
    {
        var result = await _db.Database
            .SqlQueryRaw<double>("SELECT pg_database_size(current_database())::float8 / (1024*1024) AS \"Value\"")
            .FirstOrDefaultAsync();

        return Ok(new { databaseSizeMb = Math.Round(result, 2) });
    }

    /// <summary>
    /// سجل حركات النقل والصرف التفصيلي
    /// </summary>
    [HttpGet("transfers-history")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetTransfersHistory(
        [FromQuery] string startDate, 
        [FromQuery] string endDate,
        [FromQuery] Guid? governorateId,
        [FromQuery] Guid? authorityId)
    {
        var role = _cu.Role;
        var userGovId = _cu.GovernorateId;

        // RBAC Enforcement
        if (role == "GovernorateManager" && userGovId != null)
        {
            governorateId = userGovId;
        }

        if (!DateOnly.TryParse(startDate, out var start)) start = DateOnly.MinValue;
        if (!DateOnly.TryParse(endDate, out var end)) end = DateOnly.MaxValue;

        var query = _db.StockTransfers
            .Include(t => t.FromSite)
            .Include(t => t.ToSite)
            .Include(t => t.AuthorizedBy)
            .Where(t => t.TransferDate >= start && t.TransferDate <= end)
            .AsQueryable();

        if (governorateId.HasValue)
            query = query.Where(t => t.FromSite != null && t.FromSite.GovernorateId == governorateId.Value);

        if (authorityId.HasValue)
            query = query.Where(t => t.FromSite != null && t.FromSite.AuthorityId == authorityId.Value);

        var result = await query
            .OrderByDescending(t => t.TransferDate)
            .Select(t => new {
                t.Id,
                Date = t.TransferDate,
                FromSiteName = t.FromSite!.Name,
                FromGovernorate = t.FromSite.Governorate!.Name,
                FromAuthority = t.FromSite.Authority!.Name,
                ToDestination = t.ToSite != null ? t.ToSite.Name : (t.ExternalDestination ?? "جهة خارجية غير محددة"),
                t.TransferQtyKg,
                TonDisplay = $"{t.TransferQtyKg / 1000} طن {(t.TransferQtyKg % 1000).ToString().PadLeft(3, '0')} كجم",
                Reason = string.IsNullOrWhiteSpace(t.Reason) ? "بدون مسببات" : t.Reason,
                VehicleInfo = string.IsNullOrWhiteSpace(t.VehicleInfo) ? "—" : t.VehicleInfo,
                AuthorizedBy = t.AuthorizedBy!.Name
            })
            .ToListAsync();

        return Ok(result);
    }
}


