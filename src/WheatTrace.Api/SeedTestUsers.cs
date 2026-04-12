using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using WheatTrace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace WheatTrace.Api;

public static class SeedTestUsers
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
        var defaultPassword = config["WHEATTRACE_DEFAULT_PASSWORD"];
        if (string.IsNullOrWhiteSpace(defaultPassword))
            throw new InvalidOperationException("WHEATTRACE_DEFAULT_PASSWORD is required for development seeding.");
        
        // Ensure Wadi El Gedid governorate exists to assign manager
        var wadiGov = await db.Governorates.FirstOrDefaultAsync(g => g.Name == "الوادي الجديد");
        if (wadiGov == null) return;

        var sharqiaGov = await db.Governorates.FirstOrDefaultAsync(g => g.Name == "الشرقية");

        // 1. Governorate Manager (Wadi El Gedid)
        if (!await db.Users.AnyAsync(u => u.Username == "manager1"))
        {
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "مدير الوادي الجديد (اختبار)",
                Username = "manager1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                Role = UserRole.GovernorateManager,
                GovernorateId = wadiGov.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        // 2. Inspector 1 (Wadi El Gedid)
        if (!await db.Users.AnyAsync(u => u.Username == "inspector1"))
        {
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "مفتش 1 (اختبار)",
                Username = "inspector1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                Role = UserRole.Inspector,
                GovernorateId = wadiGov.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        // 3. Inspector 2 (Sharqia - cross governorate transfer tests)
        if (sharqiaGov != null && !await db.Users.AnyAsync(u => u.Username == "inspector_sharqia"))
        {
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "مفتش شرقية (اختبار)",
                Username = "inspector_sharqia",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                Role = UserRole.Inspector,
                GovernorateId = sharqiaGov.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        // 4. Inspector Mohamed Salah
        if (wadiGov != null && !await db.Users.AnyAsync(u => u.Username == "msalah"))
        {
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "محمد صلاح",
                Username = "msalah",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                Role = UserRole.Inspector,
                GovernorateId = wadiGov.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        // 5. Supervisor (Global read)
        if (!await db.Users.AnyAsync(u => u.Username == "supervisor1"))
        {
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "مراقب وزارة 1 (اختبار)",
                Username = "supervisor1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                Role = UserRole.GeneralMonitor,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync();
        Console.WriteLine("✅ Test users seeded");
    }
}
