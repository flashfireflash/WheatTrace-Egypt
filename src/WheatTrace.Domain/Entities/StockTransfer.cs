namespace WheatTrace.Domain.Entities;

/// <summary>
/// حركة تحويل المخزون: تسجّل النقل الفعلي للقمح من موقع لآخر أو لجهة خارجية.
///
/// القاعدة الذهبية: سجلات التوريد اليومية لا تُحذف ولا تُعدَّل أبداً.
/// التحويل يُجري عملية خصم من رصيد الموقع المُرسِل وإضافة لرصيد الموقع المُستقبِل.
///
/// معادلة الرصيد المتكاملة (نقطة المحاسبة الكاملة):
///   الرصيد الحالي = إجمالي ما تم استقباله
///                  - إجمالي التحويلات الصادرة
///                  + إجمالي التحويلات الواردة
///   شرط السلامة: الرصيد الحالي ≤ طاقة الموقع الاستيعابية
/// </summary>
public class StockTransfer : BaseEntity
{
    // الموقع المُرسِل (إلزامي دائماً)
    public Guid FromSiteId { get; set; }
    public StorageSite? FromSite { get; set; }

    // الموقع المُستقبِل (اختياري - فارغ في حالة الصرف لجهة خارجية كمطحنة)
    public Guid? ToSiteId { get; set; }
    public StorageSite? ToSite { get; set; }

    /// <summary>
    /// اسم الجهة الخارجية المُستقبِلة (مثل: مطحنة الشرقية) - تُملأ عند غياب ToSiteId.
    /// </summary>
    public string? ExternalDestination { get; set; }

    // الكمية الإجمالية المُحوَّلة بالكيلوجرام
    public long TransferQtyKg { get; set; }

    // --- تفصيل الكميات حسب درجة الجودة (اختياري للتقارير التفصيلية) ---
    public int Wheat22_5Ton { get; set; }
    public int Wheat22_5Kg  { get; set; }
    public int Wheat23Ton   { get; set; }
    public int Wheat23Kg    { get; set; }
    public int Wheat23_5Ton { get; set; }
    public int Wheat23_5Kg  { get; set; }

    // تاريخ التحويل الفعلي
    public DateOnly TransferDate { get; set; }

    // سبب التحويل بالعربية (مثال: "امتلاء الموقع" أو "صرف للمطاحن")
    public string? Reason { get; set; }

    // معلومات وسيلة النقل (أرقام الشاحنات / المواصفات)
    public string? VehicleInfo { get; set; }

    // معرّف من أعتمد عملية التحويل (المدير أو الإداري)
    public Guid AuthorizedById { get; set; }
    public User? AuthorizedBy { get; set; }

    /// <summary>
    /// رابط للحدث التشغيلي الذي أدى لهذا التحويل (اختياري).
    /// مثال: إذا أُغلق الموقع بسبب الامتلاء ونُقلت الكميات، يُسجَّل حدث الإغلاق هنا.
    /// </summary>
    public Guid? TriggerEventId { get; set; }
    public SiteLifecycleEvent? TriggerEvent { get; set; }
}
