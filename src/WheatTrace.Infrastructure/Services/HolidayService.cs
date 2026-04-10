using Microsoft.EntityFrameworkCore;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Infrastructure.Services;

/// <summary>
/// خدمة العطلات الرسمية: تتحقق مما إذا كان تاريخٌ ما يُعدّ عطلةً رسمية.
/// تدعم ثلاثة مستويات من النطاق الجغرافي:
///   - وطني: يؤثر على جميع المحافظات والمواقع
///   - محافظة: يؤثر على محافظة بعينها فقط
///   - موقع: يؤثر على موقع تخزين محدد فقط
/// يدعم أيضاً العطلات المتكررة أسبوعياً (مثال: إجازة الجمعة).
/// </summary>
public class HolidayService : IHolidayService
{
    private readonly WheatTraceDbContext _db;

    public HolidayService(WheatTraceDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// يتحقق مما إذا كان التاريخ المحدد عطلةً رسمية تؤثر على الموقع أو المحافظة المعنية.
    /// يُستخدَم في DailyEntriesController لمنع إدخال بيانات في أيام العطل.
    /// استخدام AnyAsync بدلاً من FirstOrDefaultAsync لأننا نريد الحقيقة فقط (أسرع وأكثر كفاءة).
    /// </summary>
    public async Task<bool> IsHolidayAsync(DateOnly date, Guid? siteId = null, Guid? governorateId = null, CancellationToken ct = default)
    {
        // تحويل التاريخ لـ DateTime بالتوقيت العالمي لمطابقة نوع التخزين في قاعدة البيانات
        var dow = (DayOfWeek)date.DayOfWeek;
        var dateAsDateTime = DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);

        return await _db.Holidays
            .AnyAsync(h => h.IsActive &&
                // التحقق من التاريخ المحدد أو اليوم الأسبوعي المتكرر
                (h.Date == dateAsDateTime || h.DayOfWeek == dow) &&
                (
                    // عطلة وطنية: بدون محافظة وبدون موقع
                    (h.SiteId == null && h.GovernorateId == null) ||
                    // عطلة على مستوى المحافظة
                    (h.SiteId == null && h.GovernorateId == governorateId && governorateId != null) ||
                    // عطلة لموقع بعينه
                    (h.SiteId == siteId && siteId != null)
                )
            , ct);
    }
}
