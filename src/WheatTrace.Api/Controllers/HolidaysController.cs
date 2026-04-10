using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/holidays")]
[Authorize(Policy = "AdminOnly")] // Assuming Admin & Monitors use this
public class HolidaysController : ControllerBase
{
    private readonly WheatTraceDbContext _db;

    public HolidaysController(WheatTraceDbContext db) => _db = db;

    // GET /api/holidays
    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var holidays = await _db.Holidays
            .Include(h => h.Governorate)
            .Include(h => h.Site)
            .OrderByDescending(h => h.Date)
            .Select(h => new
            {
                h.Id,
                h.Name,
                h.Date,
                h.DayOfWeek,
                h.IsActive,
                h.GovernorateId,
                GovernorateName = h.Governorate != null ? h.Governorate.Name : null,
                h.SiteId,
                SiteName = h.Site != null ? h.Site.Name : null
            })
            .ToListAsync();

        return Ok(holidays);
    }

    // POST /api/holidays
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateHolidayRequest req)
    {
        if (req.Date is null && req.DayOfWeek is null)
            return BadRequest(new { message = "يجب تحديد تاريخ معين أو يوم من أيام الأسبوع" });

        var holiday = new Holiday
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Date = req.Date.HasValue ? DateTime.SpecifyKind(req.Date.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc) : null,
            DayOfWeek = req.DayOfWeek,
            IsActive = true,
            GovernorateId = req.GovernorateId,
            SiteId = req.SiteId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Holidays.Add(holiday);
        await _db.SaveChangesAsync();

        return Ok(holiday);
    }

    // PUT /api/holidays/{id}/toggle
    [HttpPut("{id:guid}/toggle")]
    public async Task<ActionResult> Toggle(Guid id)
    {
        var hd = await _db.Holidays.FindAsync(id);
        if (hd is null) return NotFound();

        hd.IsActive = !hd.IsActive;
        hd.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { hd.Id, hd.IsActive });
    }

    // DELETE /api/holidays/{id}
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var hd = await _db.Holidays.FindAsync(id);
        if (hd is null) return NotFound();

        _db.Holidays.Remove(hd);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم الحذف" });
    }
}

public record CreateHolidayRequest(
    string Name,
    DateOnly? Date,
    DayOfWeek? DayOfWeek,
    Guid? GovernorateId,
    Guid? SiteId
);
