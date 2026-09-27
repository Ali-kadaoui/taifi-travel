using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class LinkPendingAppToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserAccountId",
                table: "PendingApplications",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PendingApplications_UserAccountId",
                table: "PendingApplications",
                column: "UserAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_PendingApplications_UserAccounts_UserAccountId",
                table: "PendingApplications",
                column: "UserAccountId",
                principalTable: "UserAccounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PendingApplications_UserAccounts_UserAccountId",
                table: "PendingApplications");

            migrationBuilder.DropIndex(
                name: "IX_PendingApplications_UserAccountId",
                table: "PendingApplications");

            migrationBuilder.DropColumn(
                name: "UserAccountId",
                table: "PendingApplications");
        }
    }
}
