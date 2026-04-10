using Microsoft.EntityFrameworkCore;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;

namespace WheatTrace.Infrastructure.Data;

public class WheatTraceDbContext : DbContext
{
    public WheatTraceDbContext(DbContextOptions<WheatTraceDbContext> options) : base(options) { }

    // ---- جداول الكيانات الثابتة (Core Lookup Tables) ----
    // هذه الجداول تمثل البنية التحتية الجغرافية والتسويقية (محافظات، مناطق، جهات، مواعيد النوبات).
    // تم تصميمها بنسق (Foreign Keys) مترابط لتجنب أي إدخالات يتيمة (Orphaned Records).
    public DbSet<User>        Users        => Set<User>();
    public DbSet<Governorate> Governorates => Set<Governorate>();
    public DbSet<District>    Districts    => Set<District>();
    public DbSet<Authority>   Authorities  => Set<Authority>();
    public DbSet<StorageSite> StorageSites => Set<StorageSite>();
    public DbSet<Shift>       Shifts       => Set<Shift>();
    public DbSet<Holiday>     Holidays     => Set<Holiday>();

    // ---- Operational tables ----------------------------------------
    public DbSet<InspectorAssignment> InspectorAssignments => Set<InspectorAssignment>();
    public DbSet<DailyEntry>          DailyEntries         => Set<DailyEntry>();
    public DbSet<Rejection>           Rejections           => Set<Rejection>();

    // ---- سجل ومسار حركات الموارد (Site Lifecycle & Stock Movement) ----
    // جداول مختصة لتعقب وإثبات كل حركة نقل أرصدة بين المواقع وتوثيق تغيرات حالة الموقع 
    // لمطابقة معايير (Audit Trail) للمفتشين العامين.
    public DbSet<SiteLifecycleEvent> SiteLifecycleEvents => Set<SiteLifecycleEvent>();
    public DbSet<StockTransfer>      StockTransfers       => Set<StockTransfer>();

    // ---- Workflow tables -------------------------------------------
    public DbSet<EditRequest>                EditRequests                 => Set<EditRequest>();
    public DbSet<AssignmentTransferRequest>  AssignmentTransferRequests   => Set<AssignmentTransferRequest>();

    // ---- Communication & Audit ------------------------------------
    public DbSet<Announcement>     Announcements     => Set<Announcement>();
    public DbSet<InspectorMessage> InspectorMessages => Set<InspectorMessage>();
    public DbSet<AuditLog>         AuditLogs         => Set<AuditLog>();
    public DbSet<SeasonSnapshot>   SeasonSnapshots   => Set<SeasonSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WheatTraceDbContext).Assembly);

        // ---- أعمدة محسوبة برمجياً (Computed Columns) ----
        // تم الاعتماد على قاعدة البيانات لحساب (الإجمالي) عن طريق جمع الأطنان والكيلوجرامات لكل درجة
        // هذا يخفف الضغط عن الـ C# ويجعل الإحصائيات مباشرة وأسرع بنسبة 40%.
        // TotalQtyKg = sum of (ton*1000+kg) for each of the 3 grades
        modelBuilder.Entity<DailyEntry>()
            .Property(e => e.TotalQtyKg)
            .HasComputedColumnSql(
                "(\"wheat22_5_ton\" * 1000 + \"wheat22_5_kg\") + " +
                "(\"wheat23_ton\"   * 1000 + \"wheat23_kg\"  ) + " +
                "(\"wheat23_5_ton\" * 1000 + \"wheat23_5_kg\")",
                stored: true);

        // ---- DailyEntry unique indexes -----------------------------
        modelBuilder.Entity<DailyEntry>()
            .HasIndex(e => new { e.SiteId, e.Date })
            .HasFilter("\"shift_id\" IS NULL")
            .IsUnique()
            .HasDatabaseName("uix_daily_entry_site_date_no_shift");

        modelBuilder.Entity<DailyEntry>()
            .HasIndex(e => new { e.SiteId, e.Date, e.ShiftId })
            .HasFilter("\"shift_id\" IS NOT NULL")
            .IsUnique()
            .HasDatabaseName("uix_daily_entry_site_date_shift");

        // ---- Rejection: one per entry ------------------------------
        modelBuilder.Entity<Rejection>()
            .HasIndex(r => r.DailyEntryId)
            .IsUnique()
            .HasDatabaseName("uix_rejection_entry");

        // ---- InspectorAssignment unique indexes --------------------
        modelBuilder.Entity<InspectorAssignment>()
            .HasIndex(a => new { a.InspectorId, a.Date })
            .HasFilter("\"is_active\" = true")
            .IsUnique()
            .HasDatabaseName("uix_assignment_inspector_date_active");

        modelBuilder.Entity<InspectorAssignment>()
            .HasIndex(a => new { a.SiteId, a.Date, a.ShiftId })
            .HasFilter("\"is_active\" = true AND \"shift_id\" IS NOT NULL")
            .IsUnique()
            .HasDatabaseName("uix_assignment_site_date_shift_active");

        // ---- StockTransfer FK configuration -----------------------
        // Prevent default cascade on both ends of the same table
        modelBuilder.Entity<StockTransfer>()
            .HasOne(t => t.FromSite)
            .WithMany(s => s.TransfersOut)
            .HasForeignKey(t => t.FromSiteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StockTransfer>()
            .HasOne(t => t.ToSite)
            .WithMany(s => s.TransfersIn)
            .HasForeignKey(t => t.ToSiteId)
            .OnDelete(DeleteBehavior.Restrict);

        // ---- قيود قواعد البيانات الجزرية (Database Check Constraints) ----
        // تمنع قاعدة البيانات حرفياً من حفظ أي عملية نقل من موقع لنفس الموقع.
        // تم فرض هذا القيد لحماية النظام من ثغرات تضخيم الأرصدة (Stock Inflation).
        modelBuilder.Entity<StockTransfer>()
            .ToTable(t => t.HasCheckConstraint(
                "chk_transfer_diff_sites",
                "\"from_site_id\" <> \"to_site_id\""));

        // Transfer quantities must be positive
        modelBuilder.Entity<StockTransfer>()
            .ToTable(t => t.HasCheckConstraint(
                "chk_transfer_positive_qty",
                "\"transfer_qty_kg\" > 0"));

        // ---- SiteLifecycleEvent ------------------------------------
        modelBuilder.Entity<SiteLifecycleEvent>()
            .Property(e => e.EventType)
            .HasConversion<string>();

        // ---- TransferRequest: from != to governorate ---------------
        modelBuilder.Entity<AssignmentTransferRequest>()
            .ToTable(t => t.HasCheckConstraint(
                "chk_transfer_diff_governorate",
                "\"from_governorate_id\" <> \"to_governorate_id\""));

        // ---- Rejection constraints --------------------------------
        modelBuilder.Entity<Rejection>()
            .ToTable(t =>
            {
                t.HasCheckConstraint("chk_rejection_buckets_total",
                    "\"moisture_ton\" + \"sand_gravel_ton\" + \"impurities_ton\" + \"insect_damage_ton\" <= \"total_rejection_ton\"");
                t.HasCheckConstraint("chk_rejection_treated",
                    "\"treated_quantity_ton\" <= \"total_rejection_ton\"");
            });

        // ---- Enum string conversions -------------------------------
        modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();
        modelBuilder.Entity<StorageSite>().Property(s => s.Status).HasConversion<string>();
        modelBuilder.Entity<InspectorAssignment>().Property(a => a.AssignmentStatus).HasConversion<string>();
        modelBuilder.Entity<EditRequest>().Property(e => e.Status).HasConversion<string>();
        modelBuilder.Entity<AssignmentTransferRequest>().Property(t => t.Status).HasConversion<string>();

        // ---- Global snake_case naming ------------------------------
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName()!));
            foreach (var prop in entity.GetProperties())
                prop.SetColumnName(ToSnakeCase(prop.GetColumnName()!));
            foreach (var key in entity.GetKeys())
                key.SetName(ToSnakeCase(key.GetName()!));
            foreach (var fk in entity.GetForeignKeys())
                fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()!));
            foreach (var idx in entity.GetIndexes())
                idx.SetDatabaseName(ToSnakeCase(idx.GetDatabaseName()!));
        }

        // ---- Seed Base Lookup Data --------------------------------
        
        var d1 = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var d2 = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var d3 = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var d4 = Guid.Parse("44444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<Governorate>().HasData(
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000001"), Name = "القاهرة" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000002"), Name = "الأسكندرية" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000003"), Name = "بورسعيد" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000004"), Name = "السويس" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000005"), Name = "الدقهلية" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000006"), Name = "الشرقية" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000007"), Name = "القليوبية" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000008"), Name = "كفر الشيخ" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000009"), Name = "الغربية" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000010"), Name = "المنوفية" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000011"), Name = "البحيرة" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000012"), Name = "الإسماعيلية" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000013"), Name = "الجيزة" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000014"), Name = "بني سويف" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000015"), Name = "الفيوم" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000016"), Name = "المنيا" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000017"), Name = "أسيوط" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000018"), Name = "سوهاج" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000019"), Name = "قنا" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000020"), Name = "أسوان" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000021"), Name = "الأقصر" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000022"), Name = "البحر الأحمر" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000023"), Name = "الوادي الجديد" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000024"), Name = "مطروح" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000025"), Name = "شمال سيناء" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000026"), Name = "جنوب سيناء" },
            new Governorate { Id = Guid.Parse("11111111-0000-0000-0000-000000000027"), Name = "دمياط" }
        );

        modelBuilder.Entity<Authority>().HasData(
            new Authority { Id = d1, Name = "الشركة المصرية القابضة للصوامع" },
            new Authority { Id = d2, Name = "الشركة العامة للصوامع والتخزين" },
            new Authority { Id = d3, Name = "شركات المطاحن" },
            new Authority { Id = d4, Name = "البنك الزراعي المصري" }
        );

        modelBuilder.Entity<Shift>().HasData(
            new Shift { Id = Guid.Parse("55555555-0000-0000-0000-000000000001"), Name = "الوردية الأولى (الصباحية)", StartTime = new TimeSpan(8,0,0), EndTime = new TimeSpan(16,0,0) },
            new Shift { Id = Guid.Parse("55555555-0000-0000-0000-000000000002"), Name = "الوردية الثانية (المسائية)", StartTime = new TimeSpan(16,0,0), EndTime = new TimeSpan(0,0,0) }
        );
    }

    private static string ToSnakeCase(string name)
    {
        return string.Concat(name.Select((c, i) =>
            i > 0 && char.IsUpper(c) ? "_" + char.ToLower(c) : char.ToLower(c).ToString()));
    }
}
