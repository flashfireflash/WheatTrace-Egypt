using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddParentMessageIdToInspectorMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "parent_message_id",
                table: "inspector_messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(1091));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(1093));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(1094));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(1095));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(892));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(897));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(898));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(899));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(901));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(902));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(904));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(931));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(933));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(934));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(936));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(937));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(938));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(940));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(941));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(943));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(944));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(946));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(947));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(948));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(949));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(950));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(951));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(953));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(954));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(955));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(956));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(1120));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 56, 18, 692, DateTimeKind.Utc).AddTicks(1123));

            migrationBuilder.CreateIndex(
                name: "i_x_inspector_messages_parent_message_id",
                table: "inspector_messages",
                column: "parent_message_id");

            migrationBuilder.AddForeignKey(
                name: "f_k_inspector_messages_inspector_messages_parent_message_id",
                table: "inspector_messages",
                column: "parent_message_id",
                principalTable: "inspector_messages",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "f_k_inspector_messages_inspector_messages_parent_message_id",
                table: "inspector_messages");

            migrationBuilder.DropIndex(
                name: "i_x_inspector_messages_parent_message_id",
                table: "inspector_messages");

            migrationBuilder.DropColumn(
                name: "parent_message_id",
                table: "inspector_messages");

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9950));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9952));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9953));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9954));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9788));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9792));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9793));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9795));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9796));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9797));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9799));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9800));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9801));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9803));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9804));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9805));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9806));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9807));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9809));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9810));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9811));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9812));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9813));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9814));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9816));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9817));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9818));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9819));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9820));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9822));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9823));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9977));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 12, 46, 31, 850, DateTimeKind.Utc).AddTicks(9981));
        }
    }
}
