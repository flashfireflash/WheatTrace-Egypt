namespace WheatTrace.Domain.Entities;

/// <summary>
/// الرسالة الخاصة: نظام المراسلات الداخلي بين المراقب والمفتش.
/// يدعم الرد على الرسائل (Threading) عبر ParentMessageId.
/// الرسائل لا تُحذف بل تُوضَع علامة "مقروء" فقط للحفاظ على سجل التواصل.
/// </summary>
public class InspectorMessage : BaseEntity
{
    // المُرسِل (يمكن أن يكون مراقب عمليات أو مدير محافظة)
    public Guid SenderUserId { get; set; }
    public User? Sender { get; set; }

    // المفتش المُستقبِل للرسالة
    public Guid RecipientInspectorId { get; set; }
    public User? RecipientInspector { get; set; }

    // الموقع الذي تتعلق به الرسالة (للسياق) - اختياري للرسائل الإدارية العامة
    public Guid? SiteId { get; set; }
    public StorageSite? Site { get; set; }

    // نص الرسالة
    public string Message { get; set; } = string.Empty;

    // هل قرأ المُستقبِل الرسالة؟
    public bool IsRead { get; set; }

    // وقت القراءة الفعلي (للإحصاءات ومؤشرات الأداء)
    public DateTime? ReadAt { get; set; }

    // معرّف الرسالة الأصلية (في حالة الرد) - يبني سلسلة محادثة (Thread)
    public Guid? ParentMessageId { get; set; }
    public InspectorMessage? ParentMessage { get; set; }
}
