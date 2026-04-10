using WheatTrace.Domain.Enums;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// تكليف (انتداب) المفتش: يربط مفتشاً بموقع لتاريخ محدد.
/// السياسة: مفتش واحد فقط لكل موقع في اليوم (مع قيد فريد على قاعدة البيانات).
/// التكليفات المصفوفة (IsActive=false) تُحتفَظ بها للأرشيف لا تُحذَف.
/// </summary>
public class InspectorAssignment : BaseEntity
{
    // المفتش المنتدَب
    public Guid InspectorId { get; set; }
    public User? Inspector { get; set; }

    // الموقع المراد الانتداب إليه
    public Guid SiteId { get; set; }
    public StorageSite? Site { get; set; }

    // الوردية المحددة (اختيارية) - في حالة المواقع ذات الوردية المزدوجة
    public Guid? ShiftId { get; set; }
    public Shift? Shift { get; set; }

    // تاريخ بداية الانتداب
    public DateOnly Date { get; set; }

    /// <summary>
    /// تاريخ انتهاء التكليف (اختياري) - يُستخدم في التكليفات المؤقتة عبر المحافظات.
    /// بعد هذا التاريخ يعتبر الانتداب منتهياً تلقائياً. يمكن تحديثه في أي وقت.
    /// </summary>
    public DateOnly? EndDate { get; set; }

    // ملاحظات خاصة بهذا الانتداب
    public string? Notes { get; set; }

    // حالة التكليف (نشط / ملغي / منقول)
    public AssignmentStatus AssignmentStatus { get; set; } = AssignmentStatus.Active;

    // علامة الحالة السريعة للفلترة - تُحسَّن الاستعلامات بدلاً من مقارنة الـ Enum
    public bool IsActive { get; set; } = true;
}
