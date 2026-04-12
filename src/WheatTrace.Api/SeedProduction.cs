using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using WheatTrace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace WheatTrace.Api;

/// <summary>
/// سكريبت تهيئة بيانات الإنتاج الحقيقية على Supabase
/// يقوم بتنظيف كامل ثم إعادة بناء البيانات المطلوبة فقط
/// </summary>
public static class SeedProduction
{
    public static async Task RunAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();

        Console.WriteLine("🔄 بدء تهيئة بيانات الإنتاج...");

        // ══════════════════════════════════════════
        // 1. حذف كافة السجلات والبيانات المرتبطة
        // ══════════════════════════════════════════
        db.Rejections.RemoveRange(await db.Rejections.ToListAsync());
        db.DailyEntries.RemoveRange(await db.DailyEntries.ToListAsync());
        db.InspectorAssignments.RemoveRange(await db.InspectorAssignments.ToListAsync());
        db.EditRequests.RemoveRange(await db.EditRequests.ToListAsync());
        db.AssignmentTransferRequests.RemoveRange(await db.AssignmentTransferRequests.ToListAsync());
        db.StockTransfers.RemoveRange(await db.StockTransfers.ToListAsync());
        db.SiteLifecycleEvents.RemoveRange(await db.SiteLifecycleEvents.ToListAsync());
        db.InspectorMessages.RemoveRange(await db.InspectorMessages.ToListAsync());
        db.Announcements.RemoveRange(await db.Announcements.ToListAsync());
        db.AuditLogs.RemoveRange(await db.AuditLogs.ToListAsync());
        db.SeasonSnapshots.RemoveRange(await db.SeasonSnapshots.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("✅ تم مسح جميع السجلات اليومية والتعيينات والبيانات المرتبطة");

        // ══════════════════════════════════════════
        // 2. حذف جميع المواقع التخزينية ما عدا الوادي الجديد
        // ══════════════════════════════════════════
        var newValleyGov = await db.Governorates.FirstOrDefaultAsync(g => g.Name == "الوادي الجديد");
        if (newValleyGov != null)
        {
            var sitesToDelete = await db.StorageSites
                .Where(s => s.GovernorateId != newValleyGov.Id)
                .ToListAsync();
            db.StorageSites.RemoveRange(sitesToDelete);
            await db.SaveChangesAsync();
            Console.WriteLine($"✅ تم حذف {sitesToDelete.Count} موقع تخزيني (أبقينا مواقع الوادي الجديد فقط)");
        }

        // إعادة تصفير أرصدة مواقع الوادي الجديد
        var newValleySites = await db.StorageSites.Where(s => s.GovernorateId == newValleyGov!.Id).ToListAsync();
        foreach (var site in newValleySites)
        {
            site.CurrentStockKg = 0;
            site.TotalReceivedKg = 0;
        }
        await db.SaveChangesAsync();

        // ══════════════════════════════════════════
        // 3. تنظيف الجهات التسويقية: إبقاء 5 فقط
        // ══════════════════════════════════════════
        var allowedAuthorities = new List<string>
        {
            "الشركة المصرية القابضة للصوامع والتخزين",
            "الشركة العامة للصوامع والتخزين",
            "شركات المطاحن التابعة للشركة القابضة للصناعات الغذائية",
            "البنك الزراعي المصري",
            "جهاز مستقبل مصر للتنمية المستدامة"
        };

        foreach (var name in allowedAuthorities)
        {
            if (!await db.Authorities.AnyAsync(a => a.Name == name))
            {
                db.Authorities.Add(new Authority { Id = Guid.NewGuid(), Name = name });
            }
        }
        await db.SaveChangesAsync();

        // جلب كل الجهات محلياً أولاً لتجنب مشاكل EF Core مع Contains
        var allAuthorities = await db.Authorities.ToListAsync();
        var allowedAuthorityIds = allAuthorities.Where(a => allowedAuthorities.Contains(a.Name)).Select(a => a.Id).ToList();

        var defaultAuthority = allAuthorities.First(a => a.Name == "الشركة المصرية القابضة للصوامع والتخزين");
        var allSites = await db.StorageSites.ToListAsync();
        foreach (var site in allSites.Where(s => !allowedAuthorityIds.Contains(s.AuthorityId)))
        {
            site.AuthorityId = defaultAuthority.Id;
        }
        await db.SaveChangesAsync();

        var authoritiesToDelete = allAuthorities.Where(a => !allowedAuthorities.Contains(a.Name)).ToList();
        db.Authorities.RemoveRange(authoritiesToDelete);
        await db.SaveChangesAsync();
        Console.WriteLine($"✅ تم تنظيف الجهات التسويقية (أبقينا {allowedAuthorities.Count} فقط)");

        // ══════════════════════════════════════════
        // 4. حذف جميع المستخدمين وإعادة إنشائهم
        // ══════════════════════════════════════════
        db.Users.RemoveRange(await db.Users.ToListAsync());
        await db.SaveChangesAsync();
        Console.WriteLine("✅ تم مسح جميع المستخدمين");

        var superAdmin = new User { Id = Guid.NewGuid(), Username = "wheat_admin", Name = "مدير النظام", Role = UserRole.SuperAdmin, PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Avatar = "/avatars/avatar_m2.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(superAdmin);

        var admin = new User { Id = Guid.NewGuid(), Username = "admin", Name = "مدير النظام", Role = UserRole.Admin, PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Avatar = "/avatars/avatar_m2.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(admin);

        var supervisor = new User { Id = Guid.NewGuid(), Username = "supervisor", Name = "المراقب العام", Role = UserRole.GeneralMonitor, PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234"), Avatar = "/avatars/avatar_m1.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(supervisor);

        var monitor1 = new User { Id = Guid.NewGuid(), Username = "monitor1", Name = "مراقب عمليات 1", Role = UserRole.OperationsMonitor, PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234"), Avatar = "/avatars/avatar_m3.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(monitor1);

        var monitor2 = new User { Id = Guid.NewGuid(), Username = "monitor2", Name = "مراقب عمليات 2", Role = UserRole.OperationsMonitor, PasswordHash = BCrypt.Net.BCrypt.HashPassword("1234"), Avatar = "/avatars/avatar_m4.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(monitor2);

        var managerMalaa = new User { Id = Guid.NewGuid(), Username = "Malaa", Name = "محمود علاء على", Role = UserRole.GovernorateManager, GovernorateId = newValleyGov?.Id, PasswordHash = BCrypt.Net.BCrypt.HashPassword("M1234"), Avatar = "/avatars/avatar_m5.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(managerMalaa);

        var inspectorMsalah = new User { Id = Guid.NewGuid(), Username = "Msalah", Name = "محمد صلاح على حسن", Role = UserRole.Inspector, GovernorateId = newValleyGov?.Id, PhoneNumber = "01278701218", PasswordHash = BCrypt.Net.BCrypt.HashPassword("M1234"), Avatar = "/avatars/avatar_m6.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(inspectorMsalah);

        var inspectorAsalah = new User { Id = Guid.NewGuid(), Username = "Asalah", Name = "أيمن صلاح عبد الله محمد", Role = UserRole.Inspector, GovernorateId = newValleyGov?.Id, PasswordHash = BCrypt.Net.BCrypt.HashPassword("A1234"), Avatar = "/avatars/avatar_m7.png", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
        db.Users.Add(inspectorAsalah);

        await db.SaveChangesAsync();
        Console.WriteLine("✅ تم إنشاء جميع المستخدمين (8 مستخدمين)");

        // ══════════════════════════════════════════
        // 5. تعيين المفتشين للصوامع
        // ══════════════════════════════════════════
        var khargaSite = await db.StorageSites.FirstOrDefaultAsync(s => s.Name == "صومعة الخارجة");
        var oweinatSite = await db.StorageSites.FirstOrDefaultAsync(s => s.Name == "صومعة شرق العوينات");

        if (khargaSite != null)
        {
            khargaSite.Status = SiteStatus.Active;
            db.InspectorAssignments.Add(new InspectorAssignment
            {
                Id = Guid.NewGuid(),
                InspectorId = inspectorMsalah.Id,
                SiteId = khargaSite.Id,
                Date = new DateOnly(2026, 4, 8),
                EndDate = new DateOnly(2026, 8, 31),
                IsActive = true,
                AssignmentStatus = AssignmentStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        if (oweinatSite != null)
        {
            oweinatSite.Status = SiteStatus.Active;
            db.InspectorAssignments.Add(new InspectorAssignment
            {
                Id = Guid.NewGuid(),
                InspectorId = inspectorAsalah.Id,
                SiteId = oweinatSite.Id,
                Date = new DateOnly(2026, 4, 12),
                EndDate = new DateOnly(2026, 8, 31),
                IsActive = true,
                AssignmentStatus = AssignmentStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
        await db.SaveChangesAsync();
        Console.WriteLine("✅ تم تعيين المفتشين للصوامع");

        // ══════════════════════════════════════════
        // 6. إدخال كميات صومعة الخارجة (من الصورة)
        // ══════════════════════════════════════════
        if (khargaSite != null)
        {
            // 08/04/2026
            db.DailyEntries.Add(new DailyEntry { Id = Guid.NewGuid(), SiteId = khargaSite.Id, Date = new DateOnly(2026, 4, 8), InspectorId = inspectorMsalah.Id, Wheat22_5Ton = 109, Wheat22_5Kg = 313, Wheat23Ton = 0, Wheat23Kg = 0, Wheat23_5Ton = 0, Wheat23_5Kg = 0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            // 09/04/2026
            db.DailyEntries.Add(new DailyEntry { Id = Guid.NewGuid(), SiteId = khargaSite.Id, Date = new DateOnly(2026, 4, 9), InspectorId = inspectorMsalah.Id, Wheat22_5Ton = 131, Wheat22_5Kg = 959, Wheat23Ton = 1, Wheat23Kg = 945, Wheat23_5Ton = 0, Wheat23_5Kg = 0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            // 10/04/2026
            db.DailyEntries.Add(new DailyEntry { Id = Guid.NewGuid(), SiteId = khargaSite.Id, Date = new DateOnly(2026, 4, 10), InspectorId = inspectorMsalah.Id, Wheat22_5Ton = 156, Wheat22_5Kg = 180, Wheat23Ton = 14, Wheat23Kg = 85, Wheat23_5Ton = 0, Wheat23_5Kg = 0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            // 11/04/2026
            db.DailyEntries.Add(new DailyEntry { Id = Guid.NewGuid(), SiteId = khargaSite.Id, Date = new DateOnly(2026, 4, 11), InspectorId = inspectorMsalah.Id, Wheat22_5Ton = 303, Wheat22_5Kg = 505, Wheat23Ton = 2, Wheat23Kg = 924, Wheat23_5Ton = 0, Wheat23_5Kg = 0, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            await db.SaveChangesAsync();

            // تحديث إجمالي المخزون
            var totalKg = await db.DailyEntries
                .Where(e => e.SiteId == khargaSite.Id)
                .SumAsync(e => e.TotalQtyKg);
            khargaSite.TotalReceivedKg = totalKg;
            khargaSite.CurrentStockKg = totalKg;
            await db.SaveChangesAsync();
            Console.WriteLine($"✅ تم إدخال 4 سجلات لصومعة الخارجة (إجمالي: {totalKg / 1000.0:F3} طن)");
        }

        Console.WriteLine("🎉 تهيئة بيانات الإنتاج اكتملت بنجاح!");
    }
}
