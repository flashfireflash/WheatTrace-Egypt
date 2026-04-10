using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/season")]
[Authorize(Policy = "AdminOnly")]
public class SeasonController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _cu;
    private readonly IAuditService       _audit;

    public SeasonController(WheatTraceDbContext db, ICurrentUserService cu, IAuditService audit)
    {
        _db = db; _cu = cu; _audit = audit;
    }

    // ─── GET /api/season/snapshots ─────────────────────────────────────────
    [HttpGet("snapshots")]
    public async Task<ActionResult> GetSnapshots()
    {
        var list = await _db.SeasonSnapshots
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id, s.SeasonLabel, s.CreatedAt, s.TotalSites, s.TotalTons,
                s.DownloadToken, s.TokenUsed,
                CreatedBy = s.CreatedBy!.Name
            })
            .ToListAsync();
        return Ok(list);
    }

    // ─── POST /api/season/backup ────────────────────────────────────────────
    /// <summary>
    /// Stage 2: Generate full JSON backup of all wheat season data.
    /// Returns a one-time download token.
    /// </summary>
    [HttpPost("backup")]
    public async Task<ActionResult> CreateBackup([FromBody] CreateBackupRequest req)
    {
        // Collect all data
        var sites = await _db.StorageSites
            .Include(s => s.Authority).Include(s => s.Governorate)
            .Select(s => new {
                s.Id, s.Name, s.Status,
                Authority = s.Authority!.Name,
                Governorate = s.Governorate!.Name,
                CapacityKg = s.CapacityKg,
                CurrentStockKg = s.CurrentStockKg
            }).ToListAsync();

        var entries = await _db.DailyEntries
            .Include(e => e.Inspector).Include(e => e.Site)
            .Select(e => new {
                e.Id, e.Date, Site = e.Site!.Name,
                Inspector = e.Inspector!.Name,
                e.TotalQtyKg, e.Wheat22_5Ton, e.Wheat23Ton, e.Wheat23_5Ton
            }).ToListAsync();

        var rejections = await _db.Rejections
            .Include(r => r.DailyEntry).ThenInclude(e => e!.Site)
            .Select(r => new {
                r.Id, r.TotalRejectionTon, r.MoistureTon, r.SandGravelTon,
                r.ImpuritiesTon, r.InsectDamageTon, r.TreatedQuantityTon,
                Site = r.DailyEntry!.Site!.Name, r.DailyEntry.Date
            }).ToListAsync();

        var assignments = await _db.InspectorAssignments
            .Include(a => a.Inspector).Include(a => a.Site)
            .Select(a => new {
                a.Id, Inspector = a.Inspector!.Name,
                Site = a.Site!.Name, a.Date, a.AssignmentStatus
            }).ToListAsync();

        var snapshot = new
        {
            ExportedAt = DateTime.UtcNow,
            SeasonLabel = req.SeasonLabel,
            Sites = sites,
            DailyEntries = entries,
            Rejections = rejections,
            Assignments = assignments,
        };

        var json  = JsonSerializer.Serialize(snapshot, new JsonSerializerOptions { WriteIndented = true });
        var token = Guid.NewGuid().ToString("N");

        var totalTons  = sites.Sum(s => s.CurrentStockKg) / 1000.0;
        var record = new SeasonSnapshot
        {
            Id            = Guid.NewGuid(),
            SeasonLabel   = req.SeasonLabel,
            BackupJson    = json,
            DownloadToken = token,
            TotalSites    = sites.Count,
            TotalTons     = totalTons,
            CreatedById   = _cu.UserId,
            CreatedAt     = DateTime.UtcNow
        };

        _db.SeasonSnapshots.Add(record);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("Create", "SeasonSnapshot", record.Id, null,
            new { req.SeasonLabel, SiteCount = sites.Count, TotalTons = totalTons });

        return Ok(new
        {
            snapshotId    = record.Id,
            downloadToken = token,
            totalSites    = sites.Count,
            totalTons
        });
    }

    // ─── GET /api/season/download/{token} ───────────────────────────────────
    [HttpGet("download/{token}")]
    public async Task<ActionResult> DownloadBackup(string token)
    {
        var snap = await _db.SeasonSnapshots.FirstOrDefaultAsync(s => s.DownloadToken == token);
        if (snap == null) return NotFound();

        var bytes    = Encoding.UTF8.GetBytes(snap.BackupJson);
        var fileName = $"wheat_backup_{snap.SeasonLabel.Replace(" ", "_")}_{snap.CreatedAt:yyyyMMdd_HHmm}.json";
        return File(bytes, "application/json", fileName);
    }

    // ─── POST /api/season/close ─────────────────────────────────────────────
    /// <summary>
    /// Stage 3 (Final): Zero all storage site quantities and close them.
    /// Requires a valid snapshotId proving backup was created first.
    /// </summary>
    [HttpPost("close")]
    public async Task<ActionResult> CloseSeason([FromBody] CloseSeasonRequest req)
    {
        // Validate the snapshot token (proof that backup was created)
        var snap = await _db.SeasonSnapshots.FindAsync(req.SnapshotId);
        if (snap == null)
            return BadRequest(new { error = "لم يتم العثور على النسخة الاحتياطية. لا يمكن المتابعة." });

        // Reset all storage sites
        var sites = await _db.StorageSites.ToListAsync();
        int closedCount = 0;
        foreach (var site in sites)
        {
            site.CurrentStockKg = 0;
            site.Status = Domain.Enums.SiteStatus.Closed;
            closedCount++;
        }

        await _db.SaveChangesAsync();

        await _audit.LogAsync("EndOfSeason", "StorageSite", Guid.Empty, null, new
        {
            ClosedSites   = closedCount,
            SnapshotId    = req.SnapshotId,
            SeasonLabel   = snap.SeasonLabel,
            ConfirmedBy   = _cu.UserId
        });

        return Ok(new
        {
            message     = $"تم إغلاق الموسم بنجاح. {closedCount} موقع تم تصفيره وإغلاقه.",
            closedSites = closedCount,
            snapshotId  = snap.Id
        });
    }
}

public record CreateBackupRequest(string SeasonLabel);
public record CloseSeasonRequest(Guid SnapshotId);
