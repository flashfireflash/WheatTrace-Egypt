using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedGovernoratesAndAuthorities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "authorities",
                columns: new[] { "id", "created_at", "is_active", "name", "updated_at" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7653), true, "الشركة المصرية القابضة للصوامع", null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7654), true, "الشركة العامة للصوامع والتخزين", null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7655), true, "شركات المطاحن", null },
                    { new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7656), true, "البنك الزراعي المصري", null }
                });

            migrationBuilder.InsertData(
                table: "governorates",
                columns: new[] { "id", "created_at", "is_active", "name", "updated_at" },
                values: new object[,]
                {
                    { new Guid("11111111-0000-0000-0000-000000000001"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7413), true, "القاهرة", null },
                    { new Guid("11111111-0000-0000-0000-000000000002"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7417), true, "الأسكندرية", null },
                    { new Guid("11111111-0000-0000-0000-000000000003"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7418), true, "بورسعيد", null },
                    { new Guid("11111111-0000-0000-0000-000000000004"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7420), true, "السويس", null },
                    { new Guid("11111111-0000-0000-0000-000000000005"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7421), true, "الدقهلية", null },
                    { new Guid("11111111-0000-0000-0000-000000000006"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7422), true, "الشرقية", null },
                    { new Guid("11111111-0000-0000-0000-000000000007"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7423), true, "القليوبية", null },
                    { new Guid("11111111-0000-0000-0000-000000000008"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7425), true, "كفر الشيخ", null },
                    { new Guid("11111111-0000-0000-0000-000000000009"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7426), true, "الغربية", null },
                    { new Guid("11111111-0000-0000-0000-000000000010"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7427), true, "المنوفية", null },
                    { new Guid("11111111-0000-0000-0000-000000000011"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7428), true, "البحيرة", null },
                    { new Guid("11111111-0000-0000-0000-000000000012"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7430), true, "الإسماعيلية", null },
                    { new Guid("11111111-0000-0000-0000-000000000013"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7431), true, "الجيزة", null },
                    { new Guid("11111111-0000-0000-0000-000000000014"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7433), true, "بني سويف", null },
                    { new Guid("11111111-0000-0000-0000-000000000015"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7434), true, "الفيوم", null },
                    { new Guid("11111111-0000-0000-0000-000000000016"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7435), true, "المنيا", null },
                    { new Guid("11111111-0000-0000-0000-000000000017"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7436), true, "أسيوط", null },
                    { new Guid("11111111-0000-0000-0000-000000000018"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7438), true, "سوهاج", null },
                    { new Guid("11111111-0000-0000-0000-000000000019"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7439), true, "قنا", null },
                    { new Guid("11111111-0000-0000-0000-000000000020"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7440), true, "أسوان", null },
                    { new Guid("11111111-0000-0000-0000-000000000021"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7477), true, "الأقصر", null },
                    { new Guid("11111111-0000-0000-0000-000000000022"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7479), true, "البحر الأحمر", null },
                    { new Guid("11111111-0000-0000-0000-000000000023"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7480), true, "الوادي الجديد", null },
                    { new Guid("11111111-0000-0000-0000-000000000024"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7481), true, "مطروح", null },
                    { new Guid("11111111-0000-0000-0000-000000000025"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7482), true, "شمال سيناء", null },
                    { new Guid("11111111-0000-0000-0000-000000000026"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7483), true, "جنوب سيناء", null },
                    { new Guid("11111111-0000-0000-0000-000000000027"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7485), true, "دمياط", null }
                });

            migrationBuilder.InsertData(
                table: "shifts",
                columns: new[] { "id", "created_at", "end_time", "is_active", "name", "start_time", "updated_at" },
                values: new object[,]
                {
                    { new Guid("55555555-0000-0000-0000-000000000001"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7684), new TimeSpan(0, 16, 0, 0, 0), true, "الوردية الأولى (الصباحية)", new TimeSpan(0, 8, 0, 0, 0), null },
                    { new Guid("55555555-0000-0000-0000-000000000002"), new DateTime(2026, 4, 8, 12, 38, 45, 970, DateTimeKind.Utc).AddTicks(7688), new TimeSpan(0, 0, 0, 0, 0), true, "الوردية الثانية (المسائية)", new TimeSpan(0, 16, 0, 0, 0), null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "authorities",
                keyColumn: "id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000019"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000020"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000021"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000022"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000023"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000024"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000025"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000026"));

            migrationBuilder.DeleteData(
                table: "governorates",
                keyColumn: "id",
                keyValue: new Guid("11111111-0000-0000-0000-000000000027"));

            migrationBuilder.DeleteData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "shifts",
                keyColumn: "id",
                keyValue: new Guid("55555555-0000-0000-0000-000000000002"));
        }
    }
}
