using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Infrastructure.Data;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;

public class TestScript {
    public static async System.Threading.Tasks.Task Run(IServiceProvider sp) {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();
            
        Console.WriteLine("---- STARTING TEST ----");

        var site = await db.StorageSites.Include(s => s.DailyEntries).Include(s => s.LifecycleEvents).FirstOrDefaultAsync(s => s.Name.Contains("تجميع"));
        
        if (site == null) {
            Console.WriteLine("No site to test deletion");
        } else {
            Console.WriteLine("Testing deletion for site: " + site.Name);
            var hasAssignments = await db.InspectorAssignments.AnyAsync(a => a.SiteId == site.Id);
            Console.WriteLine("Has Assignments: " + hasAssignments);
            Console.WriteLine("Has DailyEntries: " + site.DailyEntries.Any());
            Console.WriteLine("Has LifecycleEvents: " + site.LifecycleEvents.Count);
            
            if (hasAssignments || site.DailyEntries.Any()) {
                Console.WriteLine("CANNOT DELETE SITE (Business Logic Error: hasAssignments or DailyEntries)");
            } else {
                Console.WriteLine("TRYING DELETE...");
                try {
                    db.SiteLifecycleEvents.RemoveRange(site.LifecycleEvents);
                    db.StorageSites.Remove(site);
                    await db.SaveChangesAsync();
                    Console.WriteLine("DELETED SUCCESSFULLY");
                } catch(Exception ex) {
                    Console.WriteLine("DELETE DB ERROR: " + ex.Message + " - " + ex.InnerException?.Message);
                }
            }
        }
        
        try {
            var a = new Announcement {
                Id = Guid.NewGuid(),
                Message = "Test message",
                CreatedById = (await db.Users.FirstAsync(u => u.Role == UserRole.GovernorateManager)).Id,
                IsActive = true
            };
            db.Announcements.Add(a);
            await db.SaveChangesAsync();
            Console.WriteLine("Announcement successfully saved!");
            db.Announcements.Remove(a);
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            Console.WriteLine("Error creating announcement: " + ex.Message + " " + ex.InnerException?.Message);
        }
        
        Console.WriteLine("---- DONE TEST ----");
    }
}