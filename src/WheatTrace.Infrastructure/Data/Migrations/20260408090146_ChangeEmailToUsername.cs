using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WheatTrace.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ChangeEmailToUsername : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "email",
                table: "users",
                newName: "username");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "username",
                table: "users",
                newName: "email");
        }
    }
}
