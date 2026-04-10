namespace WheatTrace.Domain.Entities;

/// <summary>
/// الكيان الجذر: جميع كيانات قاعدة البيانات ترث من هذه الفئة.
/// تضمن لكل سجل: معرّفاً فريداً (GUID) وتاريخ الإنشاء والتعديل تلقائياً.
/// استخدام GUID بدلاً من INT يمنع التخمين المتسلسل للمعرّفات (Enumeration Attacks).
/// </summary>
public abstract class BaseEntity
{
    // المعرّف الفريد - يُولَّد تلقائياً بواسطة قاعدة البيانات
    public Guid Id { get; set; }

    // تاريخ الإنشاء - يُسجَّل بالتوقيت العالمي UTC لتجنب إشكاليات تغيير التوقيت
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // تاريخ آخر تعديل - يظل فارغاً حتى أول تعديل
    public DateTime? UpdatedAt { get; set; }
}
