using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyEntrySyncTrigger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6275));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6277));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6278));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6279));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(5992));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(5997));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(5999));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6000));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6001));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6002));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6003));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6005));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6006));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6007));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6009));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6010));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6011));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6012));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6013));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6014));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6015));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6016));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6017));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6018));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6019));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6021));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6022));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6023));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6024));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6026));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6027));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6302));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 13, 19, 42, 19, 783, DateTimeKind.Utc).AddTicks(6308));

            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION trg_sync_site_totals()
RETURNS trigger AS $$
BEGIN
   IF TG_OP = 'INSERT' THEN
      UPDATE storage_sites 
      SET total_received_kg = COALESCE(total_received_kg, 0) + NEW.total_qty_kg,
          current_stock_kg = COALESCE(current_stock_kg, 0) + NEW.total_qty_kg
      WHERE id = NEW.site_id;
   ELSIF TG_OP = 'UPDATE' THEN
      UPDATE storage_sites 
      SET total_received_kg = COALESCE(total_received_kg, 0) - OLD.total_qty_kg + NEW.total_qty_kg,
          current_stock_kg = COALESCE(current_stock_kg, 0) - OLD.total_qty_kg + NEW.total_qty_kg
      WHERE id = NEW.site_id;
   ELSIF TG_OP = 'DELETE' THEN
      UPDATE storage_sites 
      SET total_received_kg = COALESCE(total_received_kg, 0) - OLD.total_qty_kg,
          current_stock_kg = COALESCE(current_stock_kg, 0) - OLD.total_qty_kg
      WHERE id = OLD.site_id;
   END IF;
   RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_site_totals_after ON daily_entries;

CREATE TRIGGER trg_sync_site_totals_after
AFTER INSERT OR UPDATE OR DELETE ON daily_entries
FOR EACH ROW EXECUTE FUNCTION trg_sync_site_totals();
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS trg_sync_site_totals_after ON daily_entries;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS trg_sync_site_totals;");

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1794));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1796));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1797));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1798));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1591));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1595));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1597));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1598));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1599));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1600));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1601));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1603));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1604));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1606));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1607));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1609));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1610));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1611));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1612));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1613));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1614));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1615));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1617));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1618));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1619));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1620));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1621));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1622));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1623));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1625));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1626));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1820));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 11, 20, 6, 32, 914, DateTimeKind.Utc).AddTicks(1824));
        }
    }
}
