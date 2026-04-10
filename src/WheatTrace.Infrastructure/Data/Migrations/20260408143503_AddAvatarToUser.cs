using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "avatar",
                table: "users",
                type: "text",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "avatar",
                table: "users");

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8453));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8455));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8456));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8456));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8194));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8198));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8200));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8201));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8202));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8205));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8206));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8207));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8209));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8211));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8212));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8214));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8215));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8216));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8218));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8219));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8221));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8257));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8258));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8260));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8262));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8263));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8264));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8266));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8267));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8268));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8269));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8485));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 14, 19, 38, 401, DateTimeKind.Utc).AddTicks(8490));
        }
    }
}
