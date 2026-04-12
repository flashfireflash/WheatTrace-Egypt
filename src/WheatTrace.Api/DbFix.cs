using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Infrastructure.Data;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;

public class CleanupWork {
    public static async System.Threading.Tasks.Task Run(IServiceProvider sp) {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();
        
        var sites = await db.StorageSites.ToListAsync();
        foreach(var site in sites) {
            if (site.Name != "صومعة الخارجة" && site.Name != "صومعة شرق العوينات") {
                site.Status = SiteStatus.Closed;
            } else {
                site.Status = SiteStatus.Active;
            }
        }
        await db.SaveChangesAsync();
        
        // Ensure lifecycle events exist for kharga and oweinat
        var kharga = sites.FirstOrDefault(s => s.Name == "صومعة الخارجة");
        var oweinat = sites.FirstOrDefault(s => s.Name == "صومعة شرق العوينات");
        
        var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
        var adminId = adminUser?.Id ?? Guid.Empty;

        if (kharga != null) {
            var exists = await db.SiteLifecycleEvents.AnyAsync(s => s.SiteId == kharga.Id && s.EventType == SiteEventType.Opened);
            if (!exists) {
                db.SiteLifecycleEvents.Add(new SiteLifecycleEvent {
                    SiteId = kharga.Id, EventType = SiteEventType.Opened, EventDate = new DateOnly(2026, 4, 8),
                    Reason = "بداية الموسم", RecordedById = adminId, StockSnapshotKg = 0
                });
            }
        }
        
        if (oweinat != null) {
            var exists = await db.SiteLifecycleEvents.AnyAsync(s => s.SiteId == oweinat.Id && s.EventType == SiteEventType.Opened);
            if (!exists) {
                db.SiteLifecycleEvents.Add(new SiteLifecycleEvent {
                    SiteId = oweinat.Id, EventType = SiteEventType.Opened, EventDate = new DateOnly(2026, 4, 12),
                    Reason = "بداية الموسم", RecordedById = adminId, StockSnapshotKg = 0
                });
            }
        }
        
        await db.SaveChangesAsync();
        Console.WriteLine("Done!"); Environment.Exit(0);
    }
}