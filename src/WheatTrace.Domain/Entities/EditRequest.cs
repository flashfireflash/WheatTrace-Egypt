using WheatTrace.Domain.Enums;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// طلب تعديل سجل التوريد: البوابة الرسمية لتصحيح الأخطاء بعد انقضاء نافذة التعديل المباشر.
/// المفتش يرفع الطلب → المدير يراجع ويوافق أو يرفض.
/// سجلات العملية تُحفَظ كاملةً لأغراض المراجعة والشفافية.
/// </summary>
public class EditRequest : BaseEntity
{
    // معرّف سجل التوريد المراد تعديله
    public Guid EntryId { get; set; }
    public DailyEntry? Entry { get; set; }

    // مقدِّم الطلب (مفتش أو مدير محافظة)
    public Guid RequestedById { get; set; }
    public User? RequestedBy { get; set; }

    /// <summary>
    /// دور مقدِّم الطلب: "Inspector" → المدير يوافق | "GovernorateManager" → مراقب العمليات يوافق
    /// </summary>
    public string RequestedByRole { get; set; } = "Inspector";

    // سبب طلب التعديل (يكتبه المدير عند رفع الطلب)
    public string? EditReason { get; set; }

    // المدير الذي وافق أو رفض الطلب
    public Guid? ApprovedById { get; set; }
    public User? ApprovedBy { get; set; }

    // حالة الطلب: قيد الانتظار / موافق / مرفوض
    public RequestStatus Status { get; set; } = RequestStatus.Pending;

    // القيم الجديدة المطلوبة (تُترك فارغة إذا لم تُعدَّل هذه الدرجة)
    public decimal? NewWheat22_5 { get; set; }
    public decimal? NewWheat23   { get; set; }
    public decimal? NewWheat23_5 { get; set; }

    // سبب الرفض (يُملأ فقط عند الرفض لإبلاغ المفتش بالسبب)
    public string? RejectionReason { get; set; }

    // الوقت الفعلي للموافقة أو الرفض (للتتبع الزمني)
    public DateTime? ApprovedAt { get; set; }
}
