namespace WheatTrace.Domain.Enums;

/// <summary>
/// حالة الطلب: تُستخدم في طلبات التعديل وطلبات نقل الانتداب.
/// Pending  → قيد الانتظار - بانتظار موافقة الجهة المختصة
/// Approved → موافق عليه - تم قبول الطلب وتنفيذه
/// Rejected → مرفوض - مع ذكر السبب في حقل RejectionReason
/// </summary>
public enum RequestStatus
{
    Pending,  // قيد الانتظار - لم يُتخذ قرار بعد
    Approved, // موافق عليه
    Rejected  // مرفوض
}
