using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Infrastructure.Data;
using WheatTrace.Infrastructure.Services;

namespace WheatTrace.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        // ---- EF Core / PostgreSQL --------------------------
        services.AddDbContext<WheatTraceDbContext>(opt =>
            opt.UseNpgsql(
                config.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(WheatTraceDbContext).Assembly.FullName)
            )
        );

        // ---- Core services ---------------------------------
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IHolidayService, HolidayService>();
        services.AddScoped<IAuditService, AuditService>();

        return services;
    }
}
