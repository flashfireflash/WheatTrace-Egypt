namespace WheatTrace.Domain.Enums;

/// <summary>
/// نوع حدث دورة الحياة: يُسجَّل مع كل تغيير في حالة الموقع.
/// </summary>
public enum SiteEventType
{
    Opened,    // الموقع فُتح للاستقبال
    Closed,    // أُغلق (امتلاء / انتهاء موسم / أمر إداري)
    Suspended, // موقوف مؤقتاً (صيانة أو ظروف طارئة)
    Resumed    // استُؤنف العمل بعد التعليق
}
