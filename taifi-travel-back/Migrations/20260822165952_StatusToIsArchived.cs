using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class StatusToIsArchived : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 2);

            // 1. Add the new boolean column
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Trips",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // 2. Safely migrate existing data
            migrationBuilder.Sql(
                @"UPDATE ""Trips"" SET ""IsArchived"" = TRUE WHERE ""Status"" IN ('Completed', 'Archived');
                  UPDATE ""Trips"" SET ""IsArchived"" = FALSE WHERE ""Status"" NOT IN ('Completed', 'Archived') OR ""Status"" IS NULL;"
            );

            // 3. Drop the old string column
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Trips");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Re-add the Status string column
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Trips",
                type: "text",
                nullable: false,
                defaultValue: "Upcoming");

            // 2. Revert the boolean data back to string
            migrationBuilder.Sql(
                @"UPDATE ""Trips"" SET ""Status"" = 'Completed' WHERE ""IsArchived"" = TRUE;
                  UPDATE ""Trips"" SET ""Status"" = 'Upcoming' WHERE ""IsArchived"" = FALSE;"
            );

            // 3. Drop the IsArchived column
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Trips");

            migrationBuilder.InsertData(
                table: "WorkerAccounts",
                columns: new[] { "Id", "FullName", "IsDisabled", "PasswordHash", "PermissionsJson", "Role", "Username" },
                values: new object[,]
                {
                    { 1, "System Admin", false, "$2a$11$24/GtOvCOBwTdtGBEPsF3Olrd23iwYILGCu6/2jPTKNMwuEO0FQZu", "{\"view_dashboard\":true,\"view_campaigns\":true,\"edit_campaigns\":true,\"view_archives\":true,\"view_hotels\":true,\"edit_hotels\":true,\"view_clients\":true,\"edit_clients\":true,\"delete_records\":true,\"issue_refunds\":true,\"manage_staff\":true}", "Admin", "admin" },
                    { 2, "Default Agent", false, "$2a$11$OCUP3z3w3VwRu0Z05/ERyueGLxY06vZW/fMAAdovQ3Cduics6j.Ze", "{\"view_dashboard\":true,\"view_campaigns\":true,\"edit_campaigns\":false,\"view_archives\":false,\"view_hotels\":true,\"edit_hotels\":false,\"view_clients\":true,\"edit_clients\":true,\"delete_records\":false,\"issue_refunds\":false,\"manage_staff\":false}", "Agent", "agent" }
                });
        }
    }
}
