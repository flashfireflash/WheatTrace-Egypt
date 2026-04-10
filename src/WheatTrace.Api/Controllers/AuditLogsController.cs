using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Policy = "AdminOnly")]
public class AuditLogsController : ControllerBase
{
    private readonly WheatTraceDbContext _db;

    public AuditLogsController(WheatTraceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = from l in _db.AuditLogs
                    join u in _db.Users on l.UserId equals u.Id into users
                    from u in users.DefaultIfEmpty()
                    orderby l.CreatedAt descending
                    select new
                    {
                        l.Id,
                        l.Action,
                        l.EntityType,
                        l.EntityId,
                        UserName = u != null ? u.Name : "System",
                        Timestamp = l.CreatedAt,
                        l.OldValues,
                        l.NewValues
                    };

        var total = await query.CountAsync();
        var logs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, items = logs });
    }

    [HttpDelete("clear")]
    public async Task<ActionResult> ClearLogs([FromQuery] int? daysOld = null)
    {
        IQueryable<AuditLog> query = _db.AuditLogs;
        
        if (daysOld.HasValue)
        {
            var cutoff = DateTime.UtcNow.AddDays(-daysOld.Value);
            query = query.Where(l => l.CreatedAt <= cutoff);
        }

        await query.ExecuteDeleteAsync();
        return Ok(new { message = "تم حذف السجلات بنجاح" });
    }
}
