using Microsoft.EntityFrameworkCore;
using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;

namespace WheatTrace.Api;

public static class SeedGovernorates
{
    private static readonly string[] EgyptGovernorates = new[]
    {
        "القاهرة", "الإسكندرية", "بورسعيد", "السويس", "الإسماعيلية",
        "دمياط", "الدقهلية", "الشرقية", "القليوبية", "كفر الشيخ",
        "الغربية", "المنوفية", "البحيرة", "الفيوم", "بني سويف",
        "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
        "مطروح", "الوادي الجديد", "البحر الأحمر", "شمال سيناء", "جنوب سيناء"
    };

    public static async Task EnsureGovernoratesExist(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();

        foreach (var govName in EgyptGovernorates)
        {
            var exists = await db.Governorates.AnyAsync(g => g.Name == govName);
            if (!exists)
            {
                db.Governorates.Add(new Governorate
                {
                    Id = Guid.NewGuid(),
                    Name = govName
                });
            }
        }
        await db.SaveChangesAsync();
    }
}
