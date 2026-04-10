namespace WheatTrace.Domain.Entities;

/// <summary>
/// لقطة الموسم: أرشيف شامل لجميع بيانات القمح في نهاية الموسم.
/// تُولَّد تلقائياً عند إغلاق الموسم وتُخزَّن بصيغة JSON قابلة للتحميل.
/// رمز التحميل (DownloadToken) يُستخدم مرة واحدة فقط لأمان الملف.
/// </summary>
public class SeasonSnapshot
{
    // المعرّف الفريد للقطة
    public Guid Id { get; set; }

    // وسم الموسم بالعربية (مثال: "موسم 2025-2026")
    public string SeasonLabel { get; set; } = string.Empty;

    // البيانات الكاملة للموسم مُشفَّرة بصيغة JSON (إجمالي الكميات لجميع المواقع والمحافظات)
    public string BackupJson { get; set; } = string.Empty;

    // رمز التحميل الفريد ذو الاستخدام الواحد (One-Time Download Token)
    public string DownloadToken { get; set; } = string.Empty;

    // هل استُخدم رمز التحميل من قبل؟ يمنع التحميل المتكرر
    public bool TokenUsed { get; set; } = false;

    // إجمالي عدد المواقع المشمولة في هذه اللقطة
    public int TotalSites { get; set; }

    // إجمالي الأطنان المستلمة في الموسم بأكمله
    public double TotalTons { get; set; }

    // تاريخ ووقت إنشاء اللقطة (بالتوقيت العالمي)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // المستخدم الذي أصدر أمر إغلاق الموسم وإنشاء اللقطة
    public Guid CreatedById { get; set; }
    public User? CreatedBy { get; set; }
}
