using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    entity_type = table.Column<string>(type: "text", nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: false),
                    old_values = table.Column<string>(type: "text", nullable: true),
                    new_values = table.Column<string>(type: "text", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_audit_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "authorities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_authorities", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "governorates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_governorates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "holidays",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    day_of_week = table.Column<int>(type: "integer", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_holidays", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "shifts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_shifts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "districts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    governorate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_districts", x => x.id);
                    table.ForeignKey(
                        name: "f_k_districts__governorates_governorate_id",
                        column: x => x.governorate_id,
                        principalTable: "governorates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    governorate_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_users", x => x.id);
                    table.ForeignKey(
                        name: "f_k_users_governorates_governorate_id",
                        column: x => x.governorate_id,
                        principalTable: "governorates",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "storage_sites",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    capacity_kg = table.Column<long>(type: "bigint", nullable: false),
                    current_stock_kg = table.Column<long>(type: "bigint", nullable: false),
                    total_received_kg = table.Column<long>(type: "bigint", nullable: false),
                    is_shift_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    latitude = table.Column<double>(type: "double precision", nullable: true),
                    longitude = table.Column<double>(type: "double precision", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    row_version = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true),
                    governorate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    district_id = table.Column<Guid>(type: "uuid", nullable: false),
                    authority_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_storage_sites", x => x.id);
                    table.ForeignKey(
                        name: "f_k_storage_sites_authorities_authority_id",
                        column: x => x.authority_id,
                        principalTable: "authorities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_storage_sites_districts_district_id",
                        column: x => x.district_id,
                        principalTable: "districts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_storage_sites_governorates_governorate_id",
                        column: x => x.governorate_id,
                        principalTable: "governorates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "announcements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    deactivated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_announcements", x => x.id);
                    table.ForeignKey(
                        name: "f_k_announcements__users_created_by_id",
                        column: x => x.created_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "assignment_transfer_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    inspector_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_governorate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    to_governorate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_site_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_shift_id = table.Column<Guid>(type: "uuid", nullable: true),
                    requested_by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    effective_date = table.Column<DateOnly>(type: "date", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_assignment_transfer_requests", x => x.id);
                    table.CheckConstraint("chk_transfer_diff_governorate", "\"from_governorate_id\" <> \"to_governorate_id\"");
                    table.ForeignKey(
                        name: "f_k_assignment_transfer_requests__governorates_from_governorate_~",
                        column: x => x.from_governorate_id,
                        principalTable: "governorates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_assignment_transfer_requests__governorates_to_governorate_id",
                        column: x => x.to_governorate_id,
                        principalTable: "governorates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_assignment_transfer_requests__shifts_target_shift_id",
                        column: x => x.target_shift_id,
                        principalTable: "shifts",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_assignment_transfer_requests__storage_sites_target_site_id",
                        column: x => x.target_site_id,
                        principalTable: "storage_sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_assignment_transfer_requests__users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_assignment_transfer_requests__users_inspector_id",
                        column: x => x.inspector_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_assignment_transfer_requests__users_requested_by_id",
                        column: x => x.requested_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "daily_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    site_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    inspector_id = table.Column<Guid>(type: "uuid", nullable: false),
                    shift_id = table.Column<Guid>(type: "uuid", nullable: true),
                    wheat22_5_ton = table.Column<int>(type: "integer", nullable: false),
                    wheat22_5_kg = table.Column<int>(type: "integer", nullable: false),
                    wheat23_ton = table.Column<int>(type: "integer", nullable: false),
                    wheat23_kg = table.Column<int>(type: "integer", nullable: false),
                    wheat23_5_ton = table.Column<int>(type: "integer", nullable: false),
                    wheat23_5_kg = table.Column<int>(type: "integer", nullable: false),
                    total_qty_kg = table.Column<long>(type: "bigint", nullable: false, computedColumnSql: "(\"wheat22_5_ton\" * 1000 + \"wheat22_5_kg\") + (\"wheat23_ton\"   * 1000 + \"wheat23_kg\"  ) + (\"wheat23_5_ton\" * 1000 + \"wheat23_5_kg\")", stored: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    row_version = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_daily_entries", x => x.id);
                    table.ForeignKey(
                        name: "f_k_daily_entries__shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "shifts",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_daily_entries__storage_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "storage_sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_daily_entries__users_inspector_id",
                        column: x => x.inspector_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "inspector_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    inspector_id = table.Column<Guid>(type: "uuid", nullable: false),
                    site_id = table.Column<Guid>(type: "uuid", nullable: false),
                    shift_id = table.Column<Guid>(type: "uuid", nullable: true),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    assignment_status = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_inspector_assignments", x => x.id);
                    table.ForeignKey(
                        name: "f_k_inspector_assignments__shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "shifts",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_inspector_assignments__storage_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "storage_sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_inspector_assignments__users_inspector_id",
                        column: x => x.inspector_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "inspector_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_id = table.Column<Guid>(type: "uuid", nullable: true),
                    recipient_inspector_id = table.Column<Guid>(type: "uuid", nullable: false),
                    site_id = table.Column<Guid>(type: "uuid", nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_inspector_messages", x => x.id);
                    table.ForeignKey(
                        name: "f_k_inspector_messages__storage_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "storage_sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_inspector_messages__users_recipient_inspector_id",
                        column: x => x.recipient_inspector_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_inspector_messages__users_sender_id",
                        column: x => x.sender_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "site_lifecycle_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    site_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_type = table.Column<string>(type: "text", nullable: false),
                    event_date = table.Column<DateOnly>(type: "date", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    recorded_by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    stock_snapshot_kg = table.Column<decimal>(type: "numeric", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_site_lifecycle_events", x => x.id);
                    table.ForeignKey(
                        name: "f_k_site_lifecycle_events__storage_sites_site_id",
                        column: x => x.site_id,
                        principalTable: "storage_sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_site_lifecycle_events__users_recorded_by_id",
                        column: x => x.recorded_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "edit_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    entry_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requested_by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    approved_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    new_wheat22_5 = table.Column<decimal>(type: "numeric", nullable: true),
                    new_wheat23 = table.Column<decimal>(type: "numeric", nullable: true),
                    new_wheat23_5 = table.Column<decimal>(type: "numeric", nullable: true),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_edit_requests", x => x.id);
                    table.ForeignKey(
                        name: "f_k_edit_requests__users_approved_by_id",
                        column: x => x.approved_by_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_edit_requests__users_requested_by_id",
                        column: x => x.requested_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_edit_requests_daily_entries_entry_id",
                        column: x => x.entry_id,
                        principalTable: "daily_entries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "rejections",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    daily_entry_id = table.Column<Guid>(type: "uuid", nullable: false),
                    total_rejection_ton = table.Column<decimal>(type: "numeric", nullable: false),
                    moisture_ton = table.Column<decimal>(type: "numeric", nullable: false),
                    sand_gravel_ton = table.Column<decimal>(type: "numeric", nullable: false),
                    impurities_ton = table.Column<decimal>(type: "numeric", nullable: false),
                    insect_damage_ton = table.Column<decimal>(type: "numeric", nullable: false),
                    treated_quantity_ton = table.Column<decimal>(type: "numeric", nullable: false),
                    row_version = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_rejections", x => x.id);
                    table.CheckConstraint("chk_rejection_buckets_total", "\"moisture_ton\" + \"sand_gravel_ton\" + \"impurities_ton\" + \"insect_damage_ton\" <= \"total_rejection_ton\"");
                    table.CheckConstraint("chk_rejection_treated", "\"treated_quantity_ton\" <= \"total_rejection_ton\"");
                    table.ForeignKey(
                        name: "f_k_rejections_daily_entries_daily_entry_id",
                        column: x => x.daily_entry_id,
                        principalTable: "daily_entries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "stock_transfers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_site_id = table.Column<Guid>(type: "uuid", nullable: false),
                    to_site_id = table.Column<Guid>(type: "uuid", nullable: false),
                    transfer_qty_kg = table.Column<long>(type: "bigint", nullable: false),
                    wheat22_5_ton = table.Column<int>(type: "integer", nullable: false),
                    wheat22_5_kg = table.Column<int>(type: "integer", nullable: false),
                    wheat23_ton = table.Column<int>(type: "integer", nullable: false),
                    wheat23_kg = table.Column<int>(type: "integer", nullable: false),
                    wheat23_5_ton = table.Column<int>(type: "integer", nullable: false),
                    wheat23_5_kg = table.Column<int>(type: "integer", nullable: false),
                    transfer_date = table.Column<DateOnly>(type: "date", nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    vehicle_info = table.Column<string>(type: "text", nullable: true),
                    authorized_by_id = table.Column<Guid>(type: "uuid", nullable: false),
                    trigger_event_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_stock_transfers", x => x.id);
                    table.CheckConstraint("chk_transfer_diff_sites", "\"from_site_id\" <> \"to_site_id\"");
                    table.CheckConstraint("chk_transfer_positive_qty", "\"transfer_qty_kg\" > 0");
                    table.ForeignKey(
                        name: "f_k_stock_transfers__storage_sites_from_site_id",
                        column: x => x.from_site_id,
                        principalTable: "storage_sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_stock_transfers__storage_sites_to_site_id",
                        column: x => x.to_site_id,
                        principalTable: "storage_sites",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "f_k_stock_transfers__users_authorized_by_id",
                        column: x => x.authorized_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_stock_transfers_site_lifecycle_events_trigger_event_id",
                        column: x => x.trigger_event_id,
                        principalTable: "site_lifecycle_events",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "i_x_announcements_created_by_id",
                table: "announcements",
                column: "created_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_assignment_transfer_requests_approved_by_id",
                table: "assignment_transfer_requests",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_assignment_transfer_requests_from_governorate_id",
                table: "assignment_transfer_requests",
                column: "from_governorate_id");

            migrationBuilder.CreateIndex(
                name: "i_x_assignment_transfer_requests_inspector_id",
                table: "assignment_transfer_requests",
                column: "inspector_id");

            migrationBuilder.CreateIndex(
                name: "i_x_assignment_transfer_requests_requested_by_id",
                table: "assignment_transfer_requests",
                column: "requested_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_assignment_transfer_requests_target_shift_id",
                table: "assignment_transfer_requests",
                column: "target_shift_id");

            migrationBuilder.CreateIndex(
                name: "i_x_assignment_transfer_requests_target_site_id",
                table: "assignment_transfer_requests",
                column: "target_site_id");

            migrationBuilder.CreateIndex(
                name: "i_x_assignment_transfer_requests_to_governorate_id",
                table: "assignment_transfer_requests",
                column: "to_governorate_id");

            migrationBuilder.CreateIndex(
                name: "i_x_daily_entries_inspector_id",
                table: "daily_entries",
                column: "inspector_id");

            migrationBuilder.CreateIndex(
                name: "i_x_daily_entries_shift_id",
                table: "daily_entries",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "uix_daily_entry_site_date_no_shift",
                table: "daily_entries",
                columns: new[] { "site_id", "date" },
                unique: true,
                filter: "\"shift_id\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "uix_daily_entry_site_date_shift",
                table: "daily_entries",
                columns: new[] { "site_id", "date", "shift_id" },
                unique: true,
                filter: "\"shift_id\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "i_x_districts_governorate_id",
                table: "districts",
                column: "governorate_id");

            migrationBuilder.CreateIndex(
                name: "i_x_edit_requests_approved_by_id",
                table: "edit_requests",
                column: "approved_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_edit_requests_entry_id",
                table: "edit_requests",
                column: "entry_id");

            migrationBuilder.CreateIndex(
                name: "i_x_edit_requests_requested_by_id",
                table: "edit_requests",
                column: "requested_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_inspector_assignments_shift_id",
                table: "inspector_assignments",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "uix_assignment_inspector_date_active",
                table: "inspector_assignments",
                columns: new[] { "inspector_id", "date" },
                unique: true,
                filter: "\"is_active\" = true");

            migrationBuilder.CreateIndex(
                name: "uix_assignment_site_date_shift_active",
                table: "inspector_assignments",
                columns: new[] { "site_id", "date", "shift_id" },
                unique: true,
                filter: "\"is_active\" = true AND \"shift_id\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "i_x_inspector_messages_recipient_inspector_id",
                table: "inspector_messages",
                column: "recipient_inspector_id");

            migrationBuilder.CreateIndex(
                name: "i_x_inspector_messages_sender_id",
                table: "inspector_messages",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "i_x_inspector_messages_site_id",
                table: "inspector_messages",
                column: "site_id");

            migrationBuilder.CreateIndex(
                name: "uix_rejection_entry",
                table: "rejections",
                column: "daily_entry_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_site_lifecycle_events_recorded_by_id",
                table: "site_lifecycle_events",
                column: "recorded_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_site_lifecycle_events_site_id",
                table: "site_lifecycle_events",
                column: "site_id");

            migrationBuilder.CreateIndex(
                name: "i_x_stock_transfers_authorized_by_id",
                table: "stock_transfers",
                column: "authorized_by_id");

            migrationBuilder.CreateIndex(
                name: "i_x_stock_transfers_from_site_id",
                table: "stock_transfers",
                column: "from_site_id");

            migrationBuilder.CreateIndex(
                name: "i_x_stock_transfers_to_site_id",
                table: "stock_transfers",
                column: "to_site_id");

            migrationBuilder.CreateIndex(
                name: "i_x_stock_transfers_trigger_event_id",
                table: "stock_transfers",
                column: "trigger_event_id");

            migrationBuilder.CreateIndex(
                name: "i_x_storage_sites_authority_id",
                table: "storage_sites",
                column: "authority_id");

            migrationBuilder.CreateIndex(
                name: "i_x_storage_sites_district_id",
                table: "storage_sites",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "i_x_storage_sites_governorate_id",
                table: "storage_sites",
                column: "governorate_id");

            migrationBuilder.CreateIndex(
                name: "i_x_users_governorate_id",
                table: "users",
                column: "governorate_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "announcements");

            migrationBuilder.DropTable(
                name: "assignment_transfer_requests");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "edit_requests");

            migrationBuilder.DropTable(
                name: "holidays");

            migrationBuilder.DropTable(
                name: "inspector_assignments");

            migrationBuilder.DropTable(
                name: "inspector_messages");

            migrationBuilder.DropTable(
                name: "rejections");

            migrationBuilder.DropTable(
                name: "stock_transfers");

            migrationBuilder.DropTable(
                name: "daily_entries");

            migrationBuilder.DropTable(
                name: "site_lifecycle_events");

            migrationBuilder.DropTable(
                name: "shifts");

            migrationBuilder.DropTable(
                name: "storage_sites");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "authorities");

            migrationBuilder.DropTable(
                name: "districts");

            migrationBuilder.DropTable(
                name: "governorates");
        }
    }
}
