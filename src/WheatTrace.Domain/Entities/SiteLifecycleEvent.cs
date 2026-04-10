using WheatTrace.Domain.Enums;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// حدث دورة حياة الموقع: يُسجَّل عند كل تغيير في حالة الموقع (فتح/إغلاق/تعليق).
/// يمكن للموقع الواحد المرور بدورات فتح/إغلاق متعددة خلال الموسم.
/// هذا السجل يشكّل سجل التدقيق الكامل (Audit Trail) لحياة الموقع التشغيلية.
/// </summary>
public class SiteLifecycleEvent : BaseEntity
{
    // الموقع الذي وقع فيه الحدث
    public Guid SiteId { get; set; }
    public StorageSite? Site { get; set; }

    // نوع الحدث: Opened (مفتوح) | Closed (مغلق) | Suspended (معلق) | Resumed (مستأنَف)
    public SiteEventType EventType { get; set; }

    // تاريخ وقوع الحدث (تاريخ الفتح أو الإغلاق الفعلي)
    public DateOnly EventDate { get; set; }

    // سبب الحدث بالتفصيل (مثل: "امتلاء الطاقة" أو "انتهاء الموسم" أو "صيانة")
    public string? Reason { get; set; }

    // المستخدم الذي سجَّل هذا الحدث (مدير المحافظة عادةً)
    public Guid RecordedById { get; set; }
    public User? RecordedBy { get; set; }

    /// <summary>
    /// لقطة الرصيد وقت الحدث - تُحفَظ للمراجعة التاريخية.
    /// تُستخدم لتأكيد صحة الأرقام قبل وبعد الإغلاق.
    /// </summary>
    public decimal StockSnapshotKg { get; set; }
}
