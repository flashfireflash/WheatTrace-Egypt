using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class MakeMessageSiteIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_inspector_messages__storage_sites_site_id",
                table: "inspector_messages");

            migrationBuilder.AlterColumn<Guid>(
                name: "site_id",
                table: "inspector_messages",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(7035));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(7037));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(7038));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(7039));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6772));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6777));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6778));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6779));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6781));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6782));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6784));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6785));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6786));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6787));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6789));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6790));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6791));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6792));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6793));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6794));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6796));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6797));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6798));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6800));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6801));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6802));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6803));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6804));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6806));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6807));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(6808));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(7069));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 19, 19, 25, 478, DateTimeKind.Utc).AddTicks(7073));

            migrationBuilder.AddForeignKey(
                name: "f_k_inspector_messages__storage_sites_site_id",
                table: "inspector_messages",
                column: "site_id",
                principalTable: "storage_sites",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_inspector_messages__storage_sites_site_id",
                table: "inspector_messages");

            migrationBuilder.AlterColumn<Guid>(
                name: "site_id",
                table: "inspector_messages",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9132));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9134));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9135));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9136));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8949));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8953));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8954));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8956));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8957));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8958));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8960));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8987));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8989));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8990));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8991));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8992));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8994));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8995));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8996));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8997));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8998));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(8999));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9000));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9002));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9003));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9004));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9006));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9007));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9008));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9009));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9010));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9155));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 9, 14, 27, 20, 125, DateTimeKind.Utc).AddTicks(9158));

            migrationBuilder.AddForeignKey(
                name: "f_k_inspector_messages__storage_sites_site_id",
                table: "inspector_messages",
                column: "site_id",
                principalTable: "storage_sites",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
