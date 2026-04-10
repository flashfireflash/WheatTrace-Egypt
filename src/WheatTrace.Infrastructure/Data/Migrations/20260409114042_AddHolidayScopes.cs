using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHolidayScopes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "governorate_id",
                table: "holidays",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "site_id",
                table: "holidays",
                type: "uuid",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5905));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5906));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5907));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5908));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5735));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5742));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5743));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5745));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5746));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5748));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5749));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5750));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5754));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5755));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5756));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5757));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5759));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5760));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5761));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5762));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5763));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5765));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5768));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5770));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5771));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5772));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5773));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5775));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5776));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5777));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5779));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5935));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 11, 40, 38, 632, DateTimeKind.Utc).AddTicks(5938));

            migrationBuilder.CreateIndex(
                name: "i_x_holidays_governorate_id",
                table: "holidays",
                column: "governorate_id");

            migrationBuilder.CreateIndex(
                name: "i_x_holidays_site_id",
                table: "holidays",
                column: "site_id");

            migrationBuilder.AddForeignKey(
                name: "f_k_holidays__storage_sites_site_id",
                table: "holidays",
                column: "site_id",
                principalTable: "storage_sites",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "f_k_holidays_governorates_governorate_id",
                table: "holidays",
                column: "governorate_id",
                principalTable: "governorates",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_holidays__storage_sites_site_id",
                table: "holidays");

            migrationBuilder.DropForeignKey(
                name: "f_k_holidays_governorates_governorate_id",
                table: "holidays");

            migrationBuilder.DropIndex(
                name: "i_x_holidays_governorate_id",
                table: "holidays");

            migrationBuilder.DropIndex(
                name: "i_x_holidays_site_id",
                table: "holidays");

            migrationBuilder.DropColumn(
                name: "governorate_id",
                table: "holidays");

            migrationBuilder.DropColumn(
                name: "site_id",
                table: "holidays");

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6286));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6288));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6289));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6290));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(5988));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(5994));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(5996));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(5997));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(5999));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6000));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6002));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6003));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6004));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6006));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6007));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6008));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6009));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6010));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6011));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6013));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6014));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6015));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6016));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6018));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6019));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6020));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6021));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6023));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6024));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6025));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6026));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6316));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 7, 51, 25, 447, DateTimeKind.Utc).AddTicks(6410));
        }
    }
}
