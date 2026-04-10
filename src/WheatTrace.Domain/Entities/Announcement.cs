namespace WheatTrace.Domain.Entities;

/// <summary>
/// الإعلان: رسالة تظهر لجميع مستخدمي المنظومة أو لفئة محددة.
/// يدعم الجدولة الزمنية والتكرار اليومي وانتهاء الصلاحية التلقائي.
/// </summary>
public class Announcement : BaseEntity
{
    // نص الإعلان الذي يظهر في شريط الإعلانات بالواجهة
    public string Message { get; set; } = string.Empty;

    // هل الإعلان نشط حالياً؟ يمكن إيقافه/تفعيله يدوياً
    public bool IsActive { get; set; } = true;

    // وقت النشر المجدوَل - null تعني النشر الفوري عند الحفظ
    public DateTime? ScheduledFor { get; set; }

    // وقت انتهاء صلاحية الإعلان تلقائياً - null تعني الإعلان الدائم
    public DateTime? ExpiresAt { get; set; }

    // هل الإعلان يتكرر يومياً في فترة زمنية محددة؟
    public bool IsRecurring { get; set; } = false;

    // وقت بداية الظهور اليومي (مثال: 08:00:00 صباحاً)
    public TimeSpan? RecurringStartTime { get; set; }

    // وقت نهاية الظهور اليومي (مثال: 16:00:00 مساءً)
    public TimeSpan? RecurringEndTime { get; set; }

    // منشئ الإعلان (مدير النظام أو المراقب العام)
    public Guid CreatedById { get; set; }
    public User? CreatedBy { get; set; }

    // وقت الإيقاف اليدوي (لو تم إيقافه قبل انتهاء صلاحيته)
    public DateTime? DeactivatedAt { get; set; }
}
