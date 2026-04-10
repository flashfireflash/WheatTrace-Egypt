using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPhoneNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "phone_number",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5579));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5581));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5582));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5583));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5099));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5110));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5258));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5259));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5261));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5262));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5264));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5265));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5266));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5268));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5269));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5270));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5272));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5273));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5274));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5276));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5277));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5278));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5279));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5281));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5282));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5283));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5284));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5286));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5287));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5293));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5295));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5615));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 15, 12, 16, 79, DateTimeKind.Utc).AddTicks(5620));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "phone_number",
                table: "users");

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3380));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3382));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3383));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3384));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3143));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3149));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3150));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3153));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3154));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3155));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3156));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3158));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3159));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3160));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3161));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3163));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3164));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3165));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3166));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3168));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3169));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3170));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3172));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3173));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3174));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3175));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3176));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3178));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3179));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3180));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3181));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3415));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 35, 2, 403, DateTimeKind.Utc).AddTicks(3419));
        }
    }
}
