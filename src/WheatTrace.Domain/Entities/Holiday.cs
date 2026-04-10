namespace WheatTrace.Domain.Entities;

/// <summary>
/// العطلة الرسمية: تُعطِّل إدخال البيانات للمفتشين في التاريخ أو اليوم المحدد.
/// تدعم ثلاثة مستويات من النطاق:
///   - GovernorateId=null + SiteId=null → عطلة وطنية تؤثر على الجميع
///   - GovernorateId=X + SiteId=null   → عطلة على مستوى المحافظة فقط
///   - SiteId=X                        → عطلة لموقع بعينه
/// </summary>
public class Holiday : BaseEntity
{
    // اسم العطلة (مثال: "ذكرى ثورة 25 يناير" أو "إجازة جمعة")
    public string Name { get; set; } = string.Empty;

    // تاريخ محدد للعطلة (مثال: 7 يناير 2026) - null إذا كانت يوم أسبوعي متكرر
    public DateTime? Date { get; set; }

    // يوم الأسبوع المتكرر (مثال: الجمعة) - null إذا كانت بتاريخ محدد
    public DayOfWeek? DayOfWeek { get; set; }

    // هل العطلة سارية الآن؟ يمكن تعطيلها بدون حذفها
    public bool IsActive { get; set; } = true;

    // المحافظة المعنية (null = تنطبق على جميع المحافظات)
    public Guid? GovernorateId { get; set; }
    public Governorate? Governorate { get; set; }

    // الموقع المعني (null = تنطبق على المستوى الأعلى)
    public Guid? SiteId { get; set; }
    public StorageSite? Site { get; set; }
}
