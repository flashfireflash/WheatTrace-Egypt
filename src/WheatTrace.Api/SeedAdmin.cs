using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using WheatTrace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace WheatTrace.Api;

public static class SeedAdmin
{
    public static async Task EnsureAdminExists(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();
        
        if (!await db.Users.AnyAsync(u => u.Username == "admin"))
        {
            var admin = new User
            {
                Id = Guid.NewGuid(),
                Name = "مدير النظام",
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Users.Add(admin);
            Console.WriteLine("✅ Admin user seeded: admin / admin123");
        }

        if (!await db.Users.AnyAsync(u => u.Username == "superuser"))
        {
            var super = new User
            {
                Id = Guid.NewGuid(),
                Name = "SuperUser",
                Username = "superuser",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("hazem2016"),
                Role = UserRole.SuperAdmin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Users.Add(super);
            Console.WriteLine("👻 SuperUser ghost seeded");
        }

        await db.SaveChangesAsync();
    }
}
