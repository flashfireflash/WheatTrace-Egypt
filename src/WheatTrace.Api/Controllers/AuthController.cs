using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Application.Common.DTOs.Auth;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

/// <summary>
/// وحدة المصادقة: تدير عمليات تسجيل الدخول وعرض وتعديل الملف الشخصي.
/// لا تستخدم attribute [Authorize] على مستوى الـ Controller للسماح بالدخول لـ /login.
/// كلمات المرور تُشفَّر دائماً بـ BCrypt ولا تُخزَّن نصاً صريحاً أبداً.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly IJwtService _jwt;

    public AuthController(WheatTraceDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    /// <summary>
    /// نقطة تسجيل الدخول: تتحقق من بيانات الدخول وتُرجع رمز JWT مع بيانات المستخدم.
    /// التحقق في خطوتين: وجود اسم المستخدم + مطابقة كلمة المرور بـ BCrypt.
    /// Include(Governorate) لجلب اسم المحافظة في استجابة واحدة بدون طلب ثانٍ.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        // البحث عن المستخدم مع بياناته الجغرافية في استعلام واحد
        var user = await _db.Users
            .Include(u => u.Governorate)
            .FirstOrDefaultAsync(u => u.Username == request.Username.Trim());

        // التحقق من وجود المستخدم وصحة كلمة المرور (BCrypt.Verify مقاوم للـ Timing Attack)
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "بيانات الدخول غير صحيحة" });

        // توليد رمز JWT يحتوي على جميع بيانات المستخدم المطلوبة
        var token = _jwt.GenerateToken(user);

        return Ok(new LoginResponse(
            Token:           token,
            UserId:          user.Id,
            Name:            user.Name,
            Role:            user.Role.ToString(),
            GovernorateId:   user.GovernorateId,
            GovernorateName: user.Governorate?.Name,
            Avatar:          user.Avatar,
            PhoneNumber:     user.PhoneNumber
        ));
    }

    /// <summary>
    /// جلب بيانات المستخدم الحالي من قاعدة البيانات (أحدث من الـ JWT المحلي).
    /// يُستخدَم عند تحديث الصفحة للتأكد من صحة البيانات.
    /// </summary>
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult> Me([FromServices] ICurrentUserService currentUser)
    {
        var user = await _db.Users
            .Include(u => u.Governorate)
            .FirstOrDefaultAsync(u => u.Id == currentUser.UserId);

        if (user is null) return Unauthorized();

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Username,
            Role            = user.Role.ToString(),
            user.GovernorateId,
            GovernorateName = user.Governorate?.Name,
            user.Avatar
        });
    }

    /// <summary>
    /// تحديث الملف الشخصي للمستخدم المُسجَّل دخول حالياً.
    /// يُعالَج كل حقل على حدة لتجنب الكتابة فوق قيم غير مُرسَلة.
    /// يُعيد 401 إذا تعذَّر إيجاد المستخدم في قاعدة البيانات.
    /// </summary>
    [HttpPut("profile")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult> UpdateProfile([FromBody] AuthUpdateProfileRequest req, [FromServices] ICurrentUserService currentUser)
    {
        var user = await _db.Users.FindAsync(currentUser.UserId);
        if (user is null) return Unauthorized();

        // تحديث الحقول المُرسَلة فقط (لا تكتب فوق غير المُرسَل)
        if (!string.IsNullOrWhiteSpace(req.Name))     user.Name     = req.Name;
        if (!string.IsNullOrWhiteSpace(req.Avatar))   user.Avatar   = req.Avatar;
        if (!string.IsNullOrWhiteSpace(req.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        // تحديث تاريخ التعديل تلقائياً
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "تم تحديث الملف الشخصي بنجاح" });
    }
}

// نموذج بيانات طلب تحديث الملف الشخصي (جميع الحقول اختيارية)
public record AuthUpdateProfileRequest(string? Name, string? Avatar, string? Password);
