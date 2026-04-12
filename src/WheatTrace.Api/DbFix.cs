using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Infrastructure.Data;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;

namespace WheatTrace.Api;

public class DbFix {
    public static async System.Threading.Tasks.Task Run(IServiceProvider sp) {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();
            
        Console.WriteLine("---- STARTING BULK CLOSE ----");
        
        var sites = await db.StorageSites.Include(s => s.LifecycleEvents).ToListAsync();
        int updated = 0;
        foreach(var site in sites) {
            // If the site is Open but has NO Opened lifecycle event
            if (site.Status == SiteStatus.Active && !site.LifecycleEvents.Any(e => e.EventType == SiteEventType.Opened)) {
                site.Status = SiteStatus.Closed;
                updated++;
            }
        }
        
        await db.SaveChangesAsync();
        Console.WriteLine($"---- DONE. CLOSED {updated} SITES ----");
    }
}