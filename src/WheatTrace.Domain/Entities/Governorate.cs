namespace WheatTrace.Domain.Entities;

/// <summary>
/// المحافظة: الوحدة الجغرافية الإدارية الأعلى في تسلسل المنظومة.
/// ترتبط بها المناطق والمواقع والمستخدمون المنتمون لها.
/// المنظومة تعمل مع جميع المحافظات المصرية الـ 27.
/// </summary>
public class Governorate : BaseEntity
{
    // اسم المحافظة بالعربية (مثال: "الشرقية")
    public string Name { get; set; } = string.Empty;

    // هل المحافظة نشطة في الموسم الحالي؟
    public bool IsActive { get; set; } = true;

    // المناطق (المراكز) المنتمية لهذه المحافظة
    public ICollection<District> Districts { get; set; } = new List<District>();

    // مواقع التخزين المنتمية لهذه المحافظة
    public ICollection<StorageSite> StorageSites { get; set; } = new List<StorageSite>();
}
