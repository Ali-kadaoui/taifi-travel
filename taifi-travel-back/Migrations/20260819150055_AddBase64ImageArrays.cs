using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class AddBase64ImageArrays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<List<string>>(
                name: "ImagesBase64",
                table: "Trips",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "ImagesBase64",
                table: "Hotels",
                type: "text[]",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PasswordHash", "PermissionsJson" },
                values: new object[] { "$2a$11$U.OkPfdAcC6eQfR9cRB36euJwZqroSp6p40UCveZfGkJ393SBkueK", "{\"view_dashboard\":true,\"view_campaigns\":true,\"edit_campaigns\":true,\"view_archives\":true,\"view_hotels\":true,\"edit_hotels\":true,\"view_clients\":true,\"edit_clients\":true,\"delete_records\":true,\"issue_refunds\":true,\"manage_staff\":true}" });

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "PasswordHash", "PermissionsJson" },
                values: new object[] { "$2a$11$5eEb1hVVwRwg6Eg6DGk6eeOM4JsWrIFr/1K7yinRSGZTAbjU4dQ0m", "{\"view_dashboard\":true,\"view_campaigns\":true,\"edit_campaigns\":false,\"view_archives\":false,\"view_hotels\":true,\"edit_hotels\":false,\"view_clients\":true,\"edit_clients\":true,\"delete_records\":false,\"issue_refunds\":false,\"manage_staff\":false}" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagesBase64",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "ImagesBase64",
                table: "Hotels");

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PasswordHash", "PermissionsJson" },
                values: new object[] { "$2a$11$EiJjvPDoTvYgPaz7lVfJaOiKE5ab6p1w9zhInz3uDJfs117vLfTky", null });

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "PasswordHash", "PermissionsJson" },
                values: new object[] { "$2a$11$jJgakwj.rTTCY7XTYTKB3uVqQkNKezkkgHwerDMmse7MoDi2C55Zi", null });
        }
    }
}
