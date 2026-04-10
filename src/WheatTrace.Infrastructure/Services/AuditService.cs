using System.Text.Json;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Infrastructure.Services;

/// <summary>
/// خدمة سجل التدقيق: تُسجِّل كل عملية حساسة يقوم بها أي مستخدم في المنظومة.
/// تُحفَظ القيم القديمة والجديدة بصيغة JSON لإمكانية المراجعة والتتبع.
/// تُسجَّل الإجراءات: الإنشاء والتعديل والحذف وعمليات الموافقة والرفض.
/// </summary>
public class AuditService : IAuditService
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuditService(WheatTraceDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    /// <summary>
    /// يُسجِّل حدثاً في سجل التدقيق مع القيم القديمة والجديدة (اختياريتان).
    /// يُستخدَم في جميع Controllers بعد أي عملية حساسة (إنشاء/تعديل/حذف).
    /// </summary>
    public async Task LogAsync(string action, string entityType, Guid entityId,
        object? oldValues = null, object? newValues = null, CancellationToken ct = default)
    {
        var log = new AuditLog
        {
            Id         = Guid.NewGuid(),
            UserId     = _currentUser.UserId,
            Action     = action,        // وصف الإجراء (مثال: "CreateDailyEntry")
            EntityType = entityType,    // نوع الكيان (مثال: "DailyEntry")
            EntityId   = entityId,      // معرّف السجل المتأثر
            // تحويل الكائنات لـ JSON للحفظ الآمن في قاعدة البيانات
            OldValues  = oldValues is null ? null : JsonSerializer.Serialize(oldValues),
            NewValues  = newValues is null ? null : JsonSerializer.Serialize(newValues)
        };

        _db.AuditLogs.Add(log);

        // حفظ فوري لضمان تسجيل الحدث حتى لو فشلت عملية أخرى لاحقاً
        await _db.SaveChangesAsync(ct);
    }
}
