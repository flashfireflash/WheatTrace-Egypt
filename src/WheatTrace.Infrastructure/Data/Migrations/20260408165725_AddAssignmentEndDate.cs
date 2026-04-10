using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignmentEndDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "expires_at",
                table: "announcements",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_recurring",
                table: "announcements",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "recurring_end_time",
                table: "announcements",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "recurring_start_time",
                table: "announcements",
                type: "interval",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "season_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    season_label = table.Column<string>(type: "text", nullable: false),
                    backup_json = table.Column<string>(type: "text", nullable: false),
                    download_token = table.Column<string>(type: "text", nullable: false),
                    token_used = table.Column<bool>(type: "boolean", nullable: false),
                    total_sites = table.Column<int>(type: "integer", nullable: false),
                    total_tons = table.Column<double>(type: "double precision", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_season_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "f_k_season_snapshots__users_created_by_id",
                        column: x => x.created_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 774, DateTimeKind.Utc).AddTicks(55));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 774, DateTimeKind.Utc).AddTicks(57));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 774, DateTimeKind.Utc).AddTicks(58));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 774, DateTimeKind.Utc).AddTicks(59));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9693));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9698));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9700));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9701));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9702));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9704));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9705));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9707));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9708));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9709));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9714));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9716));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9717));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9718));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9720));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9722));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9723));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9724));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9726));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9727));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9728));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9729));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9730));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9732));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9733));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9734));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 773, DateTimeKind.Utc).AddTicks(9735));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 774, DateTimeKind.Utc).AddTicks(90));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 57, 23, 774, DateTimeKind.Utc).AddTicks(95));

            migrationBuilder.CreateIndex(
                name: "i_x_season_snapshots_created_by_id",
                table: "season_snapshots",
                column: "created_by_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "season_snapshots");

            migrationBuilder.DropColumn(
                name: "expires_at",
                table: "announcements");

            migrationBuilder.DropColumn(
                name: "is_recurring",
                table: "announcements");

            migrationBuilder.DropColumn(
                name: "recurring_end_time",
                table: "announcements");

            migrationBuilder.DropColumn(
                name: "recurring_start_time",
                table: "announcements");

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(790));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(792));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(793));

            migrationBuilder.UpdateData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(793));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(597));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(601));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(602));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(603));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(605));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(606));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(607));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(608));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(610));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(611));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(612));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(614));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(615));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(616));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(617));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(618));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(619));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(620));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(654));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(655));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(656));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(658));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(659));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(660));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(661));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(663));

            migrationBuilder.UpdateData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(664));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(818));

            migrationBuilder.UpdateData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"),
                column: "created_at",
                value: new DateTime(2026, 4, 8, 16, 26, 6, 38, DateTimeKind.Utc).AddTicks(822));
        }
    }
}
