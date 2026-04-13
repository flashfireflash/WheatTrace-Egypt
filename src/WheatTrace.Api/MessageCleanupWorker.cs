using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api;

/// <summary>
/// خدمة تنظيف الرسائل القديمة (Background Service)
/// تعمل في الخلفية دورياً لحذف الرسائل التي مر عليها أكثر من 15 يوماً تلقائياً لتوظيف مساحات السيرفر.
/// </summary>
public class MessageCleanupWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MessageCleanupWorker> _logger;

    public MessageCleanupWorker(IServiceProvider serviceProvider, ILogger<MessageCleanupWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Message Cleanup Worker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();

                // تحديد تاريخ الاستحقاق (أقدم من 15 يوماً)
                var cutoffDate = DateTime.UtcNow.AddDays(-15);

                var oldMessages = await dbContext.InspectorMessages
                    .Where(m => m.CreatedAt < cutoffDate)
                    .ToListAsync(stoppingToken);

                if (oldMessages.Any())
                {
                    dbContext.InspectorMessages.RemoveRange(oldMessages);
                    await dbContext.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation($"Successfully purged {oldMessages.Count} old message(s) exceeding 15 days retention policy.");
                }

                // تنظيف سجل التدقيق للأقدم من 30 يوماً
                var auditCutoff = DateTime.UtcNow.AddDays(-30);
                var oldAuditLogs = await dbContext.AuditLogs
                    .Where(a => a.CreatedAt < auditCutoff)
                    .ToListAsync(stoppingToken);

                if (oldAuditLogs.Any())
                {
                    dbContext.AuditLogs.RemoveRange(oldAuditLogs);
                    await dbContext.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation($"[Scheduled Cleanup Job] Successfully purged {oldAuditLogs.Count} old audit log(s) exceeding 30 days retention policy.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while purging old messages or audit logs.");
            }

            // تنام الخدمة لمدة 12 ساعة قبل دورة الفحص التالية (عشان ميستهلكش الموارد)
            await Task.Delay(TimeSpan.FromHours(12), stoppingToken);
        }
    }
}
