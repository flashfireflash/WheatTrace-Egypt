using WheatTrace.Domain.Enums;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// طلب نقل انتداب المفتش عبر المحافظات: إجراء رسمي يبدأه مسؤول محافظة لاستقدام مفتش من محافظة أخرى.
/// يمر الطلب بدورة موافقة كاملة (Pending → Approved/Rejected).
/// القيد الأساسي: محافظة الإرسال يجب أن تختلف عن محافظة الاستقبال (مُفرَض بقاعدة البيانات).
/// </summary>
public class AssignmentTransferRequest : BaseEntity
{
    // المفتش المراد نقل انتدابه
    public Guid InspectorId { get; set; }
    public User? Inspector { get; set; }

    // المحافظة المُرسِلة (محافظة المفتش الأصلية)
    public Guid FromGovernorateId { get; set; }
    public Governorate? FromGovernorate { get; set; }

    // المحافظة المُستقبِلة (وجهة الانتداب الجديد)
    public Guid ToGovernorateId { get; set; }
    public Governorate? ToGovernorate { get; set; }

    // الموقع المستهدف داخل المحافظة المُستقبِلة
    public Guid TargetSiteId { get; set; }
    public StorageSite? TargetSite { get; set; }

    // الوردية المحددة في الموقع الجديد (اختيارية)
    public Guid? TargetShiftId { get; set; }
    public Shift? TargetShift { get; set; }

    // مقدِّم الطلب (مسؤول المحافظة المُستقبِلة عادةً)
    public Guid RequestedById { get; set; }
    public User? RequestedBy { get; set; }

    // معتمِد الطلب (مسؤول المحافظة المُرسِلة أو المراقب العام)
    public Guid? ApprovedById { get; set; }
    public User? ApprovedBy { get; set; }

    // حالة الطلب الحالية
    public RequestStatus Status { get; set; } = RequestStatus.Pending;

    // سبب الرفض (يُملَأ عند رفض الطلب فقط)
    public string? RejectionReason { get; set; }

    // تاريخ بدء النقل الفعلي بعد الموافقة
    public DateOnly EffectiveDate { get; set; }
}
