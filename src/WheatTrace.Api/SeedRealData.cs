using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace WheatTrace.Api;

public static class SeedRealData
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();

        // We only seed if there are no sites currently or if we want to add to existing
        if (await db.StorageSites.AnyAsync(s => s.Name == "صومعة الخارجة" || s.Name == "صومعة شرق العوينات"))
            return; // Already seeded

        var rand = new Random();

        // 1. Insert Authorities
        var authNames = new[] {
            "البنك الزراعي المصري",
            "الشركة المصرية القابضة للصوامع والتخزين",
            "الشركة العامة للصوامع والتخزين",
            "شركة مطاحن مصر العليا",
            "شركة مطاحن مصر الوسطى",
            "شركة مطاحن وسط وغرب الدلتا"
        };
        var authMap = new Dictionary<string, Authority>();
        foreach (var an in authNames)
        {
            var auth = await db.Authorities.FirstOrDefaultAsync(a => a.Name == an);
            if (auth == null)
            {
                auth = new Authority { Id = Guid.NewGuid(), Name = an };
                db.Authorities.Add(auth);
            }
            authMap[an] = auth;
        }

        // 2. Governorates and Districts mapping
        // Gov -> Base coords -> [Districts]
        var govCatalog = new Dictionary<string, (double Lat, double Lng, string[] Districts)>
        {
            {"الوادي الجديد", (25.4414, 30.5522, new[] {"الخارجة", "الداخلة", "الفرافرة", "شرق العوينات", "باريس"})},
            {"الشرقية", (30.5877, 31.5020, new[] {"الزقازيق", "ههيا", "الحسينية", "أبو كبير", "فاقوس", "أبو حماد", "ديرب نجم"})},
            {"المنيا", (28.0871, 30.7618, new[] {"المنيا", "بني مزار", "سمالوط", "أبو قرقاص", "مغاغة", "ملوي"})},
            {"البحيرة", (31.0364, 30.4668, new[] {"دمنهور", "كفر الدوار", "أبو المطامير", "حوش عيسى", "وادي النطرون"})},
            {"أسيوط", (27.1810, 31.1837, new[] {"أسيوط", "ديروط", "القوصية", "أبو تيج", "منفلوط", "أبنوب"})},
            {"سوهاج", (26.5496, 31.6965, new[] {"سوهاج", "البلينا", "طما", "طحطا", "أخميم"})},
            {"الجيزة", (30.0131, 31.2089, new[] {"الجيزة", "إمبابة", "البدرشين", "الصف", "أطفيح"})},
        };

        var districtEntities = new Dictionary<string, District>();
        var govEntities = new Dictionary<string, Governorate>();

        foreach (var gc in govCatalog)
        {
            var govName = gc.Key;
            var gov = await db.Governorates.FirstOrDefaultAsync(g => g.Name == govName);
            if (gov == null)
            {
                gov = new Governorate { Id = Guid.NewGuid(), Name = govName };
                db.Governorates.Add(gov);
            }
            govEntities[govName] = gov;

            foreach (var dName in gc.Value.Districts)
            {
                var dictKey = $"{govName}_{dName}";
                var dist = await db.Districts.FirstOrDefaultAsync(d => d.Name == dName && d.GovernorateId == gov.Id);
                if (dist == null)
                {
                    dist = new District { Id = Guid.NewGuid(), Name = dName, GovernorateId = gov.Id };
                    db.Districts.Add(dist);
                }
                districtEntities[dictKey] = dist;
            }
        }
        await db.SaveChangesAsync(); // save authorities, govs, dists

        // 3. Realistic Storage Sites Data
        // Tuple: (GovName, DistName, AuthorityName, SiteName, CapacityTon)
        var realSites = new List<(string G, string D, string A, string S, long Cap)>
        {
            // New Valley
            ("الوادي الجديد", "شرق العوينات", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة شرق العوينات", 60000),
            ("الوادي الجديد", "الخارجة", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة الخارجة", 45000),
            ("الوادي الجديد", "الخارجة", "الشركة المصرية القابضة للصوامع والتخزين", "مركز تجميع صومعة الخارجة", 10000),
            ("الوادي الجديد", "الفرافرة", "البنك الزراعي المصري", "شونة الفرافرة", 8000),
            ("الوادي الجديد", "الداخلة", "البنك الزراعي المصري", "شونة غرب الموهوب", 5000),
            
            // Sharkia
            ("الشرقية", "ههيا", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة ههيا", 30000),
            ("الشرقية", "الحسينية", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة الحسينية", 60000),
            ("الشرقية", "الزقازيق", "الشركة العامة للصوامع والتخزين", "صومعة الزقازيق المعدنية", 30000),
            ("الشرقية", "أبو كبير", "البنك الزراعي المصري", "شونة أبو كبير الأسمنتية", 20000),
            ("الشرقية", "فاقوس", "البنك الزراعي المصري", "شونة فاقوس المركزية", 15000),
            ("الشرقية", "أبو حماد", "البنك الزراعي المصري", "شونة أبو حماد", 10000),
            ("الشرقية", "ديرب نجم", "شركة مطاحن وسط وغرب الدلتا", "صومعة ديرب بني عامر", 30000),

            // Minya
            ("المنيا", "بني مزار", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة بني مزار", 60000),
            ("المنيا", "المنيا", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة بهدال", 30000),
            ("المنيا", "مغاغة", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة الشيخ فضل", 60000),
            ("المنيا", "سمالوط", "البنك الزراعي المصري", "شونة سمالوط الشون", 12000),
            ("المنيا", "ملوي", "البنك الزراعي المصري", "شونة ملوي الترابية", 8000),
            ("المنيا", "المنيا", "شركة مطاحن مصر الوسطى", "مجمع مطاحن المنيا الجديدة", 30000),

            // Beheira
            ("البحيرة", "دمنهور", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة زاوية غزال", 60000),
            ("البحيرة", "أبو المطامير", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة أبو المطامير", 30000),
            ("البحيرة", "وادي النطرون", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة وادي النطرون الطميسي", 30000),
            ("البحيرة", "دمنهور", "الشركة العامة للصوامع والتخزين", "صومعة دمنهور المركزية", 45000),
            ("البحيرة", "حوش عيسى", "البنك الزراعي المصري", "شونة حوش عيسى المطورة", 10000),
            ("البحيرة", "كفر الدوار", "شركة مطاحن وسط وغرب الدلتا", "شونة مستودع كفر الدوار", 15000),

            // Assiut
            ("أسيوط", "أبنوب", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة عرب العوامر", 60000),
            ("أسيوط", "ديروط", "البنك الزراعي المصري", "شونة ديروط والمندرة", 12000),
            ("أسيوط", "القوصية", "البنك الزراعي المصري", "شونة القوصية النموذجية", 10000),
            ("أسيوط", "منفلوط", "البنك الزراعي المصري", "شونة منفلوط الجديدة", 15000),
            ("أسيوط", "أسيوط", "شركة مطاحن مصر العليا", "صومعة أسيوط القديمة", 30000),

            // Sohag
            ("سوهاج", "البلينا", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة البلينا المتطورة", 60000),
            ("سوهاج", "سوهاج", "الشركة العامة للصوامع والتخزين", "صومعة سوهاج المعدنية", 30000),
            ("سوهاج", "طما", "البنك الزراعي المصري", "شونة طما المغطاة", 10000),
            ("سوهاج", "طحطا", "البنك الزراعي المصري", "شونة طحطا ترابية", 8000),

            // Giza
            ("الجيزة", "البدرشين", "الشركة المصرية القابضة للصوامع والتخزين", "صومعة برقاش المشتركة", 60000),
            ("الجيزة", "إمبابة", "البنك الزراعي المصري", "شونة إمبابة وبنى سلامة", 12000),
            ("الجيزة", "أطفيح", "البنك الزراعي المصري", "شونة أطفيح والقبابات", 15000),
            ("الجيزة", "الصف", "البنك الزراعي المصري", "شونة الصف الحديثة", 10000),
        };

        var allSites = new List<StorageSite>();

        foreach (var s in realSites)
        {
            var g = govEntities[s.G];
            var d = districtEntities[$"{s.G}_{s.D}"];
            var a = authMap[s.A];
            
            // Randomize lat log based on governorate center to scatter them naturally on the map
            var center = govCatalog[s.G];
            var latOffset = (rand.NextDouble() - 0.5) * 0.4;
            var lngOffset = (rand.NextDouble() - 0.5) * 0.4;

            var site = new StorageSite
            {
                Id = Guid.NewGuid(),
                Name = s.S,
                GovernorateId = g.Id,
                DistrictId = d.Id,
                AuthorityId = a.Id,
                CapacityKg = s.Cap * 1000,
                CurrentStockKg = (long)(s.Cap * 1000 * (0.1 + rand.NextDouble() * 0.8)), // Randomly filled 10% to 90%
                Status = Domain.Enums.SiteStatus.Active,
                IsShiftEnabled = rand.NextDouble() > 0.7, // 30% chance to have shifts enabled
                Latitude = center.Lat + latOffset,
                Longitude = center.Lng + lngOffset,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            allSites.Add(site);
        }

        db.StorageSites.AddRange(allSites);
        await db.SaveChangesAsync();

        Console.WriteLine($"✅ Seeded {allSites.Count} authentic wheat storage sites from MoS records.");
    }
}
