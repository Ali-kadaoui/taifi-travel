using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class AddIsFromWebsite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFromWebsite",
                table: "ClientProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFromWebsite",
                table: "ClientProfiles");
        }
    }
}
