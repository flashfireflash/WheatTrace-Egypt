using WheatTrace.Domain.Enums;

namespace WheatTrace.Domain.Entities;

/// <summary>
/// كيان المستخدم: يمثل أي حساب داخل المنظومة بصرف النظر عن دوره.
/// كلمة المرور مُعمَّاة دائماً بـ BCrypt ولا تُخزَّن نصاً صريحاً أبداً.
/// التفويض يعتمد على حقل Role بالكامل ويُقرأ من JWT عند كل طلب.
/// </summary>
public class User : BaseEntity
{
    // الاسم الكامل للمستخدم كما يظهر في لوحة التحكم
    public string Name { get; set; } = string.Empty;

    // اسم المستخدم للدخول - فريد ولا يتكرر في قاعدة البيانات
    public string Username { get; set; } = string.Empty;

    // هاش كلمة المرور المُشفَّر بـ BCrypt - لا يمكن عكسه
    public string PasswordHash { get; set; } = string.Empty;

    // الدور الوظيفي - يُحدد الصلاحيات في كل أنحاء النظام
    public UserRole Role { get; set; }

    // رابط الصورة الشخصية (اختياري) - يُخزَّن في Supabase Storage
    public string? Avatar { get; set; }

    // رقم الهاتف (اختياري) - لأغراض التواصل الداخلي
    public string? PhoneNumber { get; set; }

    // معرّف المحافظة - إلزامي لمديري المحافظات والمفتشين، فارغ للمراقبين والإدارة العامة
    public Guid? GovernorateId { get; set; }

    // الكيان المرتبط بالمحافظة - يُجلَّب بـ Include عند الحاجة فقط (Lazy-free)
    public Governorate? Governorate { get; set; }
}
