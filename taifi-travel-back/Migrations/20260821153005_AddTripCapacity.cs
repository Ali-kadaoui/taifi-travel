using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class AddTripCapacity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Trips",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$bYsRybvtQvFthhbWmOzmBePjmQfndOzTo0WB0j0SQ2EQuBJDSn5BO");

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$bzZOHsKEylHtHET/R469G.jDUZwtAA0pKMASHEqjoj/pzs9CBB.3O");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Trips");

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$U.OkPfdAcC6eQfR9cRB36euJwZqroSp6p40UCveZfGkJ393SBkueK");

            migrationBuilder.UpdateData(
                table: "WorkerAccounts",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$5eEb1hVVwRwg6Eg6DGk6eeOM4JsWrIFr/1K7yinRSGZTAbjU4dQ0m");
        }
    }
}
