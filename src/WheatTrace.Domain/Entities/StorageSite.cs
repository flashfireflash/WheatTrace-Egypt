using System.ComponentModel.DataAnnotations;
using WheatTrace.Domain.Enums;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// موقع التخزين: الوحدة الجغرافية الأساسية في المنظومة.
/// كل موقع مرتبط بمحافظة وجهة تسويقية، ويمتلك سعة تخزينية ثابتة.
/// الرصيد الحالي يُحسَّب تلقائياً عبر العمليات المتتالية ويُقفَل تفاؤلياً (Optimistic Lock).
/// </summary>
public class StorageSite : BaseEntity
{
    // اسم الموقع كما يظهر في جميع الشاشات والتقارير
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// الطاقة الاستيعابية الأقصى بالكيلوجرام - لا تتغير بعد الإنشاء.
    /// عند اقتراب الرصيد من هذه القيمة تظهر تحذيرات في الواجهة.
    /// </summary>
    public long CapacityKg { get; set; }

    /// <summary>
    /// الرصيد الحالي المتاح بالكيلوجرام - يتحرك بكل عملية إضافة أو نقل.
    /// المعادلة: مجموع الإدخالات - مجموع التحويلات الصادرة + مجموع التحويلات الواردة.
    /// يُحدَّث بقفل تشاؤمي (Pessimistic Lock) لضمان الاتساق في البيئات المتزامنة.
    /// </summary>
    public long CurrentStockKg { get; set; }

    /// <summary>
    /// إجمالي ما استقبله الموقع تاريخياً منذ الافتتاح - لا يُخصَم أبداً.
    /// يُستخدم في التقارير السنوية والمراجعات الحكومية.
    /// </summary>
    public long TotalReceivedKg { get; set; }

    // هل يعمل الموقع بنظام الوردية المزدوجة أم لا؟
    public bool IsShiftEnabled { get; set; }

    /// <summary>
    /// استثناء الوردية: يُفعَّل نظام الوردية داخل فترة زمنية محددة فقط.
    /// مثال: خلال موسم الذروة من 1 مايو إلى 15 يونيو.
    /// خارج هذه الفترة يعمل الموقع بإعداد IsShiftEnabled الأساسي.
    /// </summary>
    public DateOnly? ExceptionStartDate { get; set; }
    public DateOnly? ExceptionEndDate { get; set; }

    // إحداثيات GPS للموقع على الخريطة التفاعلية (اختيارية)
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    /// <summary>
    /// وصف نصي للموقع أو رابط Google Maps - يُستخدم عند عدم توفر إحداثيات دقيقة.
    /// </summary>
    public string? LocationText { get; set; }

    /// <summary>
    /// الحالة التشغيلية للموقع - مُشتَقَّة من آخر حدث في سجل دورة الحياة.
    /// Open = آخر حدث كان فتح | Closed = آخر حدث كان إغلاق أو تعليق.
    /// </summary>
    public SiteStatus Status { get; set; } = SiteStatus.Closed;

    // رمز إصدار السجل لمنع التعارض عند التعديل المتزامن
    [Timestamp]
    public byte[]? RowVersion { get; set; }

    // --- روابط الكيانات الخارجية ---
    // المحافظة الإلزامية التي ينتمي إليها الموقع
    public Guid GovernorateId { get; set; }
    public Governorate? Governorate { get; set; }

    // المنطقة الإدارية (اختيارية) داخل المحافظة
    public Guid? DistrictId { get; set; }
    public District? District { get; set; }

    // الجهة التسويقية المسؤولة عن الموقع (إلزامية)
    public Guid AuthorityId { get; set; }
    public Authority? Authority { get; set; }

    // --- مجموعات التنقل (Navigation Collections) ---
    // تُجلَّب بـ Include عند الحاجة فقط لتجنب N+1 queries
    public ICollection<DailyEntry> DailyEntries { get; set; } = [];
    public ICollection<SiteLifecycleEvent> LifecycleEvents { get; set; } = [];
    public ICollection<StockTransfer> TransfersOut { get; set; } = []; // تحويلات صادرة
    public ICollection<StockTransfer> TransfersIn  { get; set; } = []; // تحويلات واردة

    /// <summary>
    /// تحديث أرباح وتجميع المخزون للموقع مع التحقق من صلاحية الأرصدة
    /// </summary>
    public void ApplyTransaction(long deltaKg, bool isCollectionEntry)
    {
        if (CurrentStockKg + deltaKg > CapacityKg)
            throw new InvalidOperationException($"الكمية تتجاوز الطاقة التخزينية المتاحة. المتبقي: {CapacityKg - CurrentStockKg} كجم");

        if (CurrentStockKg + deltaKg < 0)
            throw new InvalidOperationException("لا يمكن تقليل الكمية لأن الرصيد الحالي سيصبح سالباً");

        if (isCollectionEntry && TotalReceivedKg + deltaKg < 0)
            throw new InvalidOperationException("لا يمكن تقليل الكمية لأن الإجمالي التاريخي سيصبح سالباً");

        CurrentStockKg += deltaKg;
        
        if (isCollectionEntry)
            TotalReceivedKg += deltaKg;
    }

    /// <summary>
    /// تطبيق نقل صادر من الموقع مع التحقق من الرصيد المتاح.
    /// الصادر ينقص الرصيد الحالي ولا يؤثر على الإجمالي (التاريخي).
    /// </summary>
    public void ApplyOutboundTransfer(long deltaKg)
    {
        if (deltaKg <= 0)
            throw new ArgumentException("الكمية يجب أن تكون موجبة", nameof(deltaKg));
            
        if (CurrentStockKg < deltaKg)
            throw new InvalidOperationException($"الكمية المطلوب نقلها ({deltaKg / 1000} طن) أكبر من الرصيد الحالي ({CurrentStockKg / 1000} طن)");

        CurrentStockKg -= deltaKg;
    }

    /// <summary>
    /// تطبيق نقل وارد إلى الموقع مع التحقق من السعة التخزينية المتاحة.
    /// الوارد يزيد الرصيد الحالي ويزيد الإجمالي (لأنه رصيد دخل الموقع).
    /// </summary>
    public void ApplyInboundTransfer(long deltaKg)
    {
        if (deltaKg <= 0)
            throw new ArgumentException("الكمية يجب أن تكون موجبة", nameof(deltaKg));
            
        if (CurrentStockKg + deltaKg > CapacityKg)
            throw new InvalidOperationException($"الموقع الهدف لا يتسع للكمية. المتاح: {(CapacityKg - CurrentStockKg) / 1000} طن");

        CurrentStockKg += deltaKg;
        TotalReceivedKg += deltaKg;
    }
}
