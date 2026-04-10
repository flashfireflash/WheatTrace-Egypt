using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using WheatTrace.Application.Common.Interfaces;

namespace WheatTrace.Infrastructure.Services;

/// <summary>
/// خدمة المستخدم الحالي: تستخرج هوية المستخدم المُسجَّل من رمز JWT في كل طلب HTTP.
/// تعتمد على IHttpContextAccessor للوصول للـ ClaimsPrincipal الممرَّر من طبقة المصادقة.
/// تُحقَن في Controllers والـ Services عبر Dependency Injection للوصول الآمن لبيانات المستخدم.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserService(IHttpContextAccessor http)
    {
        _http = http;
    }

    // اختصار للوصول السريع لكيان المستخدم الحالي من سياق HTTP
    private ClaimsPrincipal? User => _http.HttpContext?.User;

    /// <summary>
    /// معرّف المستخدم الحالي (GUID) - مُستخرَج من الـ Claim "sub" في رمز JWT.
    /// يُعيد Guid.Empty إذا لم يكن المستخدم مُسجَّل دخول.
    /// </summary>
    public Guid UserId
    {
        get
        {
            // يدعم كلاً من "NameIdentifier" و "sub" لتوافقية أوسع مع JWT
            var val = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? User?.FindFirst("sub")?.Value;
            return Guid.TryParse(val, out var id) ? id : Guid.Empty;
        }
    }

    /// <summary>
    /// الدور الوظيفي للمستخدم الحالي - يُستخدَم في RBAC وفلترة البيانات.
    /// </summary>
    public string Role =>
        User?.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

    /// <summary>
    /// معرّف محافظة المستخدم - null للأدوار ذات الصلاحية الوطنية (مدير النظام، المراقب العام).
    /// إلزامي لمسؤولي المحافظات والمفتشين ويُستخدَم في فلترة البيانات تلقائياً.
    /// </summary>
    public Guid? GovernorateId
    {
        get
        {
            var val = User?.FindFirst("governorate_id")?.Value;
            return Guid.TryParse(val, out var id) ? id : null;
        }
    }

    // الاسم الكامل للمستخدم - يظهر في الواجهة وسجل التدقيق
    public string Name =>
        User?.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
}
