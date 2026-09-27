using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDeadColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Applications_QrCodeId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "EmailVerified",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "PhoneVerified",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "ExactAmountPaid",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "QrCodeId",
                table: "Applications");


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailVerified",
                table: "UserAccounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PhoneVerified",
                table: "UserAccounts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "ExactAmountPaid",
                table: "Applications",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "QrCodeId",
                table: "Applications",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_QrCodeId",
                table: "Applications",
                column: "QrCodeId",
                unique: true);
        }
    }
}
