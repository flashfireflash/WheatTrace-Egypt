using Microsoft.EntityFrameworkCore;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api.Services;

/// <summary>
/// Background service to keep Supabase Postgres active.
/// Supabase's free tier pauses databases after 7 days of inactivity.
/// This service automatically runs a lightweight query every hour using 
/// the existing database connection string, preventing external GitHub Actions
/// from needing direct database credentials.
/// </summary>
public class SupabaseKeepAliveService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<SupabaseKeepAliveService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(1);

    public SupabaseKeepAliveService(IServiceProvider services, ILogger<SupabaseKeepAliveService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Supabase Keep-Alive Service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // We must create a new scope because BackgroundService is a singleton
                // and WheatTraceDbContext is scoped.
                using var scope = _services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();

                // Execute a minimal raw SQL query to hit the database instance
                await dbContext.Database.ExecuteSqlRawAsync("SELECT 1;", stoppingToken);

                _logger.LogInformation("Supabase Keep-Alive ping successful at: {time}", DateTimeOffset.Now);
            }
            catch (Exception ex)
            {
                // Even if it fails, we catch the error so the worker loop doesn't crash completely.
                _logger.LogError(ex, "Supabase Keep-Alive ping failed.");
            }

            // Wait for the next cycle
            await Task.Delay(_interval, stoppingToken);
        }
    }
}
