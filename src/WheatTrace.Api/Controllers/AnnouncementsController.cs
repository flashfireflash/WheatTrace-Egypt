using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;
using WheatTrace.Application.Common.Interfaces;

namespace WheatTrace.Api.Controllers;

/// <summary>
/// وحدة الإعلانات: تُدير إنشاء وعرض الإعلانات لجميع مستخدمي المنظومة.
/// تدعم الجدولة الزمنية وانتهاء الصلاحية التلقائي والإعلانات المتكررة.
/// معالجة نوافذ الإعلان الليلية (مثل 22:00 → 06:00) مدعومة بالكامل.
/// </summary>
[ApiController]
[Route("api/announcements")]
public class AnnouncementsController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public AnnouncementsController(WheatTraceDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    /// <summary>
    /// جلب الإعلانات المرئية حالياً فقط - مع مراعاة:
    /// - ScheduledFor: يجب أن يكون في الماضي (أو فارغاً)
    /// - ExpiresAt: يجب أن يكون في المستقبل (أو فارغاً)
    /// - IsRecurring: يظهر فقط في النافذة الزمنية المحددة (بالتوقيت العالمي)
    /// الفلترة الزمنية للتكرار تتم في الذاكرة لأن قواعد البيانات لا تدعم TimeSpan مباشرة.
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult> GetActiveAnnouncements()
    {
        var now     = DateTime.UtcNow;
        var nowTime = now.TimeOfDay;

        // جلب الإعلانات النشطة المجدوَلة وغير المنتهية من قاعدة البيانات
        var all = await _db.Announcements
            .Where(a => a.IsActive)
            .Where(a => a.ScheduledFor == null || a.ScheduledFor <= now)
            .Where(a => a.ExpiresAt    == null || a.ExpiresAt    >  now)
            .OrderByDescending(a => a.ScheduledFor ?? a.CreatedAt)
            .Select(a => new {
                a.Id, a.Message, a.CreatedAt, a.ScheduledFor, a.ExpiresAt,
                a.IsRecurring, a.RecurringStartTime, a.RecurringEndTime
            })
            .ToListAsync();

        // فلترة في الذاكرة للإعلانات المتكررة (لا يمكن فعلها في SQL بكفاءة)
        var visible = all.Where(a =>
        {
            if (!a.IsRecurring) return true;
            if (a.RecurringStartTime == null || a.RecurringEndTime == null) return true;

            // دعم النوافذ الزمنية التي تتجاوز منتصف الليل (مثال: 22:00 → 06:00)
            if (a.RecurringStartTime <= a.RecurringEndTime)
                return nowTime >= a.RecurringStartTime && nowTime <= a.RecurringEndTime;
            else
                return nowTime >= a.RecurringStartTime || nowTime <= a.RecurringEndTime;
        }).ToList();

        return Ok(visible);
    }

    /// <summary>
    /// جلب جميع الإعلانات (بما فيها المجدولة وغير النشطة) - للإدارة فقط.
    /// </summary>
    [HttpGet("all")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetAllAnnouncements()
    {
        var all = await _db.Announcements
            .OrderByDescending(a => a.ScheduledFor ?? a.CreatedAt)
            .Select(a => new {
                a.Id, a.Message, a.IsActive, a.CreatedAt,
                a.ScheduledFor, a.ExpiresAt,
                a.IsRecurring, a.RecurringStartTime, a.RecurringEndTime
            })
            .ToListAsync();
        return Ok(all);
    }

    /// <summary>
    /// إنشاء إعلان جديد مع دعم الجدولة والمدة والتكرار.
    /// إذا تم إرسال DurationHours بدل ExpiresAt، تُحسَب انتهاء الصلاحية تلقائياً.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> CreateAnnouncement([FromBody] CreateAnnouncementRequest req)
    {
        try {
            if (string.IsNullOrWhiteSpace(req.Message)) return BadRequest(new { error = "نص الإعلان مطلوب" });

            TimeSpan? parsedStartTime = null;
            TimeSpan? parsedEndTime = null;

            if (req.IsRecurring) {
                if (string.IsNullOrWhiteSpace(req.RecurringStartTime) || string.IsNullOrWhiteSpace(req.RecurringEndTime))
                    return BadRequest(new { error = "الإعلانات الدورية تتطلب تحديد وقت البداية والنهاية." });
                
                if (TimeSpan.TryParse(req.RecurringStartTime, out var st)) parsedStartTime = st;
                if (TimeSpan.TryParse(req.RecurringEndTime, out var et)) parsedEndTime = et;
            }

            DateTime? expiresAt = req.ExpiresAt?.ToUniversalTime();
            if (expiresAt == null && req.DurationHours.HasValue && req.DurationHours > 0)
            {
                var startPoint = req.ScheduledFor?.ToUniversalTime() ?? DateTime.UtcNow;
                expiresAt = startPoint.AddHours(req.DurationHours.Value);
            }

            var announcement = new Announcement
            {
                Id                 = Guid.NewGuid(),
                Message            = req.Message,
                IsActive           = true,
                ScheduledFor       = req.ScheduledFor?.ToUniversalTime(),
                ExpiresAt          = expiresAt,
                IsRecurring        = req.IsRecurring,
                RecurringStartTime = parsedStartTime,
                RecurringEndTime   = parsedEndTime,
                CreatedById        = _currentUser.UserId
            };

            _db.Announcements.Add(announcement);
            await _db.SaveChangesAsync();
            await _audit.LogAsync("Create", "Announcement", announcement.Id, null, new { req.Message, req.IsRecurring });
            return Ok(announcement);
        } catch (Exception ex) {
            return BadRequest(new { error = "خادم الويب: " + ex.InnerException?.Message ?? ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> DeleteAnnouncement(Guid id)
    {
        var announcement = await _db.Announcements.FindAsync(id);
        if (announcement == null) return NotFound();

        _db.Announcements.Remove(announcement);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("Delete", "Announcement", id, new { message = announcement.Message }, null);
        return Ok(new { message = "تم الحذف" });
    }
}

// نموذج بيانات إنشاء إعلان جديد
public record CreateAnnouncementRequest(
    string    Message,
    DateTime? ScheduledFor       = null,
    DateTime? ExpiresAt          = null,
    double?   DurationHours      = null,
    bool      IsRecurring        = false,
    string?   RecurringStartTime = null,
    string?   RecurringEndTime   = null
);
