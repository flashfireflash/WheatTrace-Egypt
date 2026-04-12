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
        var config = scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
        var defaultPassword = config["WHEATTRACE_DEFAULT_PASSWORD"];
        if (string.IsNullOrWhiteSpace(defaultPassword))
            throw new InvalidOperationException("WHEATTRACE_DEFAULT_PASSWORD is required for development seeding.");

        var superPassword = config["WHEATTRACE_SUPER_PASSWORD"];
        if (string.IsNullOrWhiteSpace(superPassword))
            throw new InvalidOperationException("WHEATTRACE_SUPER_PASSWORD is required for development seeding.");
        
        if (!await db.Users.AnyAsync(u => u.Username == "admin"))
        {
            var admin = new User
            {
                Id = Guid.NewGuid(),
                Name = "مدير النظام",
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Users.Add(admin);
            Console.WriteLine("✅ Admin user seeded: admin");
        }

        if (!await db.Users.AnyAsync(u => u.Username == "superuser"))
        {
            var super = new User
            {
                Id = Guid.NewGuid(),
                Name = "SuperUser",
                Username = "superuser",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(superPassword),
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
