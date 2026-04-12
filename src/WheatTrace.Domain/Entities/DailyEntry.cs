using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// سجل التوريد اليومي: جوهر المنظومة - يسجّل كميات القمح المستلمة يومياً من كل موقع.
/// الكميات تُخزَّن منفصلةً (طن + كجم) لكل درجة جودة لتجنب مشاكل الدقة العشرية.
/// الإجمالي (TotalQtyKg) محسوب بالكامل داخل قاعدة البيانات لضمان الدقة والأداء.
/// </summary>
public class DailyEntry : BaseEntity
{
    // معرّف موقع التخزين الذي يخدمه هذا السجل
    public Guid SiteId { get; set; }
    public StorageSite? Site { get; set; }

    // تاريخ اليوم (DateOnly) - لا يحتوي على وقت لتجنب إشكاليات المناطق الزمنية
    public DateOnly Date { get; set; }

    // معرّف المفتش المسؤول عن إدخال هذا السجل
    public Guid InspectorId { get; set; }
    public User? Inspector { get; set; }

    // معرّف الوردية (اختياري) - إذا كان الموقع يعمل بنظام وردية مزدوجة
    public Guid? ShiftId { get; set; }
    public Shift? Shift { get; set; }

    // --- كميات القمح مقسّمة حسب درجة الجودة (Grade) ---
    // القاعدة: الكجم يجب أن يكون بين 0 و 999 فقط (أقل من طن كامل)

    // درجة 22.5 قنطار
    public int Wheat22_5Ton { get; set; }   // الأطنان الكاملة
    public int Wheat22_5Kg { get; set; }    // الكيلوجرامات المتبقية (0-999)

    // درجة 23 قنطار
    public int Wheat23Ton { get; set; }
    public int Wheat23Kg { get; set; }

    // درجة 23.5 قنطار
    public int Wheat23_5Ton { get; set; }
    public int Wheat23_5Kg { get; set; }

    /// <summary>
    /// الإجمالي بالكيلوجرام - محسوب داخل قاعدة البيانات (Computed Column - Stored).
    /// لا تحاول تعديله من الكود - هو للقراءة فقط.
    /// طريقة العرض: TotalQtyKg / 1000 = الأطنان | TotalQtyKg % 1000 = الكجم المتبقي.
    /// </summary>
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public long TotalQtyKg { get; private set; }

    // ملاحظات اختيارية يدوّنها المفتش على السجل
    public string? Notes { get; set; }

    /// <summary>
    /// علامة تشير إلى أن مدير المحافظة طلب تعديل هذا السجل وتمت الموافقة عليه من مراقب العمليات.
    /// تُعرض على الواجهة كـ badge تحذيري لتنبيه الجميع بوجود تعديل.
    /// </summary>
    public bool IsEditedByManager { get; set; } = false;

    // ملاحظة المدير عند طلب التعديل (سبب التعديل)
    public string? ManagerEditNote { get; set; }

    // تاريخ آخر تعديل معتمد من مراقب العمليات
    public DateTime? EditApprovedAt { get; set; }

    /// <summary>
    /// رمز إصدار السجل (Optimistic Concurrency) - يمنع الكتابة المتضاربة من جهازَين في نفس الوقت.
    /// تُديره قاعدة البيانات تلقائياً وتُحدَّث عند كل تعديل.
    /// </summary>
    [Timestamp]
    public byte[]? RowVersion { get; set; }

    // سجل المرفوضات المرتبط (One-to-One)
    public Rejection? Rejection { get; set; }
}
