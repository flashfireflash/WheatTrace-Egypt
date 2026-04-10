namespace WheatTrace.Domain.Entities;

/// <summary>
/// الوردية (النوبة): تُحدد الفترة الزمنية لعمل المفتش في الموقع.
/// المنظومة تدعم وردية صباحية ووردية مسائية لكل موقع.
/// يمكن تفعيل الوردية المزدوجة على مستوى الموقع أو فترة استثنائية بعينها.
/// </summary>
public class Shift : BaseEntity
{
    // اسم الوردية باللغة العربية (مثال: "الوردية الأولى (الصباحية)")
    public string Name { get; set; } = string.Empty;

    // وقت بداية الوردية (مثال: 08:00:00)
    public TimeSpan StartTime { get; set; }

    // وقت نهاية الوردية (مثال: 16:00:00)
    public TimeSpan EndTime { get; set; }

    // هل الوردية مفعّلة للاستخدام؟
    public bool IsActive { get; set; } = true;
}
