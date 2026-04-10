using System.ComponentModel.DataAnnotations;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// سجل المرفوضات: يُلحَق بكل سجل توريد يومي (One-to-One).
/// الكميات بالأطنان بدقة 3 أرقام عشرية مطابقةً لنماذج التقارير المصرية الرسمية.
/// مثال: 1.040 طن = 1040 كجم.
/// القيد الجوهري: مجموع أسباب الرفض ≤ إجمالي المرفوض (تُفرضه قاعدة البيانات).
/// </summary>
public class Rejection : BaseEntity
{
    // معرّف سجل التوريد اليومي المرتبط
    public Guid DailyEntryId { get; set; }
    public DailyEntry? DailyEntry { get; set; }

    // إجمالي الكمية المرفوضة بالأطنان (مجموع كل الأسباب)
    public decimal TotalRejectionTon { get; set; }

    // --- تفاصيل أسباب الرفض (Rejection Buckets) ---
    // كل سبب بالأطنان وقيمته لا تتجاوز الإجمالي

    public decimal MoistureTon { get; set; }        // رطوبة عالية
    public decimal SandGravelTon { get; set; }      // رمل ولزط
    public decimal ImpuritiesTon { get; set; }      // شوائب عالية
    public decimal InsectDamageTon { get; set; }    // إصابة حشرية

    // الكمية التي تمت معالجتها من المرفوض (لا تتجاوز TotalRejectionTon)
    public decimal TreatedQuantityTon { get; set; }

    // رمز إصدار السجل لمنع التعارض عند التعديل المتزامن
    [Timestamp]
    public byte[]? RowVersion { get; set; }
}
