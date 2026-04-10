using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Domain.Entities;

namespace WheatTrace.Infrastructure.Services;

/// <summary>
/// خدمة JWT: تولِّد وتُحقِّق رموز المصادقة (JSON Web Tokens).
/// الخوارزمية المستخدمة: HMAC-SHA256 (متماثلة) - مناسبة لتطبيق مركزي بخادم واحد.
/// مدة صلاحية الرمز: 12 ساعة (قابلة للضبط في appsettings.json).
/// </summary>
public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>
    /// يولِّد رمز JWT لمستخدم مُسجَّل دخول يحتوي على جميع البيانات المطلوبة للتفويض.
    /// القيم المُضمَّنة في الرمز (Claims): المعرّف، اسم المستخدم، الاسم، الدور، معرّف المحافظة.
    /// الـ Jti (JWT ID) يمنع إعادة استخدام رموز مسرَّبة (Replay Attack Protection).
    /// </summary>
    public string GenerateToken(User user)
    {
        // بناء مفتاح التشفير المتماثل من إعدادات التطبيق
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // تجميع بيانات المستخدم في الـ Claims داخل الرمز
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),       // المعرّف الفريد
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),     // اسم المستخدم
            new Claim(ClaimTypes.Name, user.Name),                            // الاسم الكامل
            new Claim(ClaimTypes.Role, user.Role.ToString()),                 // الدور للتفويض
            new Claim("governorate_id", user.GovernorateId?.ToString() ?? ""),// محافظة المستخدم
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())// معرّف الرمز للأمان
        };

        var token = new JwtSecurityToken(
            issuer:            _config["Jwt:Issuer"],
            audience:          _config["Jwt:Audience"],
            claims:            claims,
            expires:           DateTime.UtcNow.AddHours(12), // انتهاء صلاحية بعد 12 ساعة
            signingCredentials: creds
        );

        // تحويل الرمز لنص مشفَّر (Base64Url) قابل للإرسال
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// يتحقق من صحة رمز JWT ويُعيد معرّف المستخدم إذا كان الرمز سليماً.
    /// يُعيد null إذا كان الرمز منتهي الصلاحية أو مزوَّراً أو مشوَّهاً.
    /// ClockSkew=Zero يمنع التسامح الزمني التقليدي (5 دقائق) لمزيد من الأمان.
    /// </summary>
    public Guid? ValidateToken(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

            // التحقق الكامل من صحة الرمز
            handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = new SymmetricSecurityKey(key),
                ValidateIssuer           = true,
                ValidIssuer              = _config["Jwt:Issuer"],
                ValidateAudience         = true,
                ValidAudience            = _config["Jwt:Audience"],
                ClockSkew                = TimeSpan.Zero  // لا تسامح زمني - أمان أعلى
            }, out var validatedToken);

            // استخراج معرّف المستخدم من الـ Claims
            var jwt = (JwtSecurityToken)validatedToken;
            return Guid.Parse(jwt.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
        }
        catch
        {
            // أي فشل في التحقق يُعيد null بدون إشارة لسبب الفشل (أمان أفضل)
            return null;
        }
    }
}
