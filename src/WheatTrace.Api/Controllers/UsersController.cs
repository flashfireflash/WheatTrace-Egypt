using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Domain.Enums;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Controllers;

/// <summary>
/// وحدة إدارة المستخدمين: تُتيح إنشاء وتعديل وحذف حسابات المستخدمين.
/// خاضعة لنظام RBAC صارم يمنع تجاوز الصلاحيات الهرمية:
///   - مسؤول المحافظة: يُنشئ ويُعدِّل المفتشين في محافظته فقط
///   - المراقبون: لا يستطيعون تعديل المدراء أو المستوى الأعلى
///   - مدير النظام: صلاحية كاملة على الجميع
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly WheatTraceDbContext _db;

    public UsersController(WheatTraceDbContext db) => _db = db;

    /// <summary>
    /// جلب قائمة المستخدمين - مع فلترة حسب دور المستخدم الطالب.
    /// مسؤول المحافظة يرى المفتشين فقط | الإدارة ترى الجميع.
    /// الحساب ذو الصلاحية العليا لا يظهر مطلقاً في أي نتيجة.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> GetAll([FromQuery] string? role = null)
    {
        // بناء الاستعلام الأساسي مع استبعاد الحساب ذي الصلاحية العليا دائماً
        var query = _db.Users
            .AsNoTracking()
            .Include(u => u.Governorate)
            .Where(u => u.Role != UserRole.SuperAdmin)
            .AsQueryable();

        // استخراج دور المستخدم الحالي من الـ Claims
        var currentUserRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;

        // مسؤول المحافظة لا يرى سوى المفتشين لأغراض الانتداب والتكليف
        if (currentUserRole == "GovernorateManager")
        {
            query = query.Where(u => u.Role == UserRole.Inspector);
        }

        // فلترة إضافية حسب الدور إذا طُلبت
        if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, out var parsedRole))
        {
            query = query.Where(u => u.Role == parsedRole);
        }

        // تجميع النتائج مع تحديد الحقول المطلوبة فقط (لا نُرسل PasswordHash أبداً)
        var users = await query
            .OrderBy(u => u.Name)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Username,
                Role            = u.Role.ToString(),
                u.GovernorateId,
                GovernorateName = u.Governorate != null ? u.Governorate.Name : null,
                u.PhoneNumber,
                u.CreatedAt,
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// إنشاء مستخدم جديد مع تشفير كلمة المرور وتطبيق قيود الصلاحية.
    /// مسؤول المحافظة يستطيع إنشاء مفتشين لمحافظته فقط.
    /// رقم الهاتف إلزامي للمفتشين للتواصل الميداني.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> Create([FromBody] CreateUserRequest req)
    {
        // التحقق من عدم تكرار اسم المستخدم
        if (await _db.Users.AnyAsync(u => u.Username == req.Username))
            return Conflict(new { message = "اسم المستخدم موجود بالفعل" });

        // التحقق من صحة الدور المُرسَل
        if (!Enum.TryParse<UserRole>(req.Role, out var role))
            return BadRequest(new { message = "الدور غير صحيح" });

        // التحقق من رقم الهاتف للمفتشين
        if (role == UserRole.Inspector && string.IsNullOrWhiteSpace(req.PhoneNumber))
            return BadRequest(new { message = "يجب إدخال رقم الهاتف للمفتشين" });

        // استخراج بيانات المستخدم الحالي لتطبيق قيود المحافظة
        var currentUserRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        var currentUserGovIdString = User.Claims.FirstOrDefault(c => c.Type == "governorate_id")?.Value;
        _ = Guid.TryParse(currentUserGovIdString, out Guid currentUserGovId);

        // مسؤول المحافظة: يُنشئ مفتشين لمحافظته فقط
        if (currentUserRole == "GovernorateManager")
        {
            if (role != UserRole.Inspector || req.GovernorateId != currentUserGovId)
                return Forbid();
        }

        // إنشاء المستخدم مع تشفير كلمة المرور بـ BCrypt
        var user = new WheatTrace.Domain.Entities.User
        {
            Id            = Guid.NewGuid(),
            Name          = req.Name,
            Username      = req.Username,
            PasswordHash  = BCrypt.Net.BCrypt.HashPassword(req.Password), // تشفير BCrypt (لا نُخزِّن نصاً)
            Role          = role,
            GovernorateId = req.GovernorateId,
            PhoneNumber   = req.PhoneNumber,
            CreatedAt     = DateTime.UtcNow,
            UpdatedAt     = DateTime.UtcNow,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // نُرجع المعرّف والاسم والدور فقط (لا نُرجع PasswordHash أبداً)
        return Ok(new { user.Id, user.Name, user.Username, Role = user.Role.ToString() });
    }

    /// <summary>
    /// تعديل بيانات مستخدم موجود مع التحقق من صلاحية المُعدِّل.
    /// كلمة المرور اختيارية - إذا أُرسلت تُشفَّر من جديد.
    /// يمنع مسؤول المحافظة من تعديل مستخدمين خارج محافظته أو من رفع درجة المفتش.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateUserRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(new { message = "المستخدم غير موجود" });

        if (!Enum.TryParse<UserRole>(req.Role, out var role))
            return BadRequest(new { message = "الدور غير صحيح" });

        // استخراج بيانات المُعدِّل
        var currentUserRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        var currentUserGovIdString = User.Claims.FirstOrDefault(c => c.Type == "governorate_id")?.Value;
        _ = Guid.TryParse(currentUserGovIdString, out Guid currentUserGovId);

        // RBAC: مسؤول المحافظة يُعدِّل مفتشي محافظته فقط ولا يستطيع رفع درجتهم
        if (currentUserRole == "GovernorateManager")
        {
            if (user.Role != UserRole.Inspector || user.GovernorateId != currentUserGovId ||
                role != UserRole.Inspector       || req.GovernorateId  != currentUserGovId)
                return Forbid();
        }
        // RBAC: المراقبون لا يعدِّلون المدراء أو أعلى
        else if (currentUserRole == "GeneralMonitor" || currentUserRole == "OperationsMonitor")
        {
            if (user.Role == UserRole.Admin || user.Role == UserRole.SuperAdmin ||
                role       == UserRole.Admin || role       == UserRole.SuperAdmin)
                return Forbid();
        }

        // تطبيق التعديلات
        user.Name          = req.Name;
        user.Role          = role;
        user.GovernorateId = req.GovernorateId;
        user.PhoneNumber   = req.PhoneNumber;
        user.UpdatedAt     = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(req.Username) && req.Username != user.Username)
        {
            if (await _db.Users.AnyAsync(u => u.Id != user.Id && u.Username == req.Username))
                return Conflict(new { message = "اسم المستخدم موجود مسبقاً لمستخدم آخر" });
            user.Username = req.Username;
        }

        // تشفير كلمة المرور الجديدة إذا أُرسلت
        if (!string.IsNullOrWhiteSpace(req.NewPassword))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);

        await _db.SaveChangesAsync();
        return Ok(new { user.Id, user.Name, Role = user.Role.ToString() });
    }

    /// <summary>
    /// حذف مستخدم مع التحقق من عدم حذف الحساب الحالي.
    /// يُطبَّق نفس نظام RBAC الخاص بالتعديل على الحذف.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> Delete(Guid id,
        [FromServices] WheatTrace.Application.Common.Interfaces.ICurrentUserService currentUser)
    {
        // لا يمكن للمستخدم حذف نفسه
        if (id == currentUser.UserId)
            return BadRequest(new { message = "لا يمكنك حذف حسابك الخاص" });

        var user = await _db.Users.FindAsync(id);
        if (user is null) return NotFound(new { message = "المستخدم غير موجود" });

        // استخراج بيانات الحاذف لتطبيق صلاحيات الحذف
        var currentUserRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        var currentUserGovIdString = User.Claims.FirstOrDefault(c => c.Type == "governorate_id")?.Value;
        _ = Guid.TryParse(currentUserGovIdString, out Guid currentUserGovId);

        // مسؤول المحافظة يحذف مفتشي محافظته فقط
        if (currentUserRole == "GovernorateManager")
        {
            if (user.Role != UserRole.Inspector || user.GovernorateId != currentUserGovId)
                return Forbid();
        }
        // المراقبون لا يحذفون المدراء أو أعلى
        else if (currentUserRole == "GeneralMonitor" || currentUserRole == "OperationsMonitor")
        {
            if (user.Role == UserRole.Admin || user.Role == UserRole.SuperAdmin)
                return Forbid();
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم حذف المستخدم" });
    }

    /// <summary>
    /// تحديث الملف الشخصي الذاتي: يسمح لأي مستخدم بتعديل بياناته الشخصية.
    /// يتحقق من عدم تكرار اسم المستخدم قبل التغيير.
    /// </summary>
    [HttpPut("profile")]
    public async Task<ActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest req,
        [FromServices] WheatTrace.Application.Common.Interfaces.ICurrentUserService currentUser)
    {
        var user = await _db.Users.FindAsync(currentUser.UserId);
        if (user is null) return NotFound(new { message = "المستخدم غير موجود" });

        // التحقق من عدم تكرار اسم المستخدم الجديد إذا تم تغييره
        if (!string.IsNullOrWhiteSpace(req.Username) && req.Username != user.Username)
        {
            if (await _db.Users.AnyAsync(u => u.Id != user.Id && u.Username == req.Username))
                return Conflict(new { message = "اسم المستخدم موجود مسبقاً لمستخدم آخر" });
            user.Username = req.Username;
        }

        // تطبيق التغييرات للحقول المُرسَلة فقط
        if (!string.IsNullOrWhiteSpace(req.Name))     user.Name     = req.Name;
        if (req.Avatar is not null)                    user.Avatar   = req.Avatar;
        if (!string.IsNullOrWhiteSpace(req.NewPassword))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        if (req.PhoneNumber is not null)               user.PhoneNumber = req.PhoneNumber;

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "تم تحديث البيانات بنجاح", user.Id, user.Name, user.Username, user.Avatar });
    }
}

// ── نماذج بيانات الطلبات (Request DTOs) ────────────────────────────────────────────

// بيانات إنشاء مستخدم جديد
public record CreateUserRequest(
    string Name,
    string Username,
    string Password,
    string Role,
    Guid?  GovernorateId,
    string? PhoneNumber
);

// بيانات تعديل مستخدم موجود (كلمة المرور واسم المستخدم اختياري)
public record UpdateUserRequest(
    string  Name,
    string? Username,
    string  Role,
    Guid?   GovernorateId,
    string? NewPassword,
    string? PhoneNumber
);

// بيانات التحديث الذاتي للملف الشخصي (جميع الحقول اختيارية)
public record UpdateProfileRequest(
    string? Name,
    string? Username,
    string? NewPassword,
    string? PhoneNumber,
    string? Avatar
);
