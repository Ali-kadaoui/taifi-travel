using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class AddTripHotelOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TripHotelOffers",
                columns: table => new
                {
                    TripId = table.Column<int>(type: "integer", nullable: false),
                    HotelOfferId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripHotelOffers", x => new { x.TripId, x.HotelOfferId });
                    table.ForeignKey(
                        name: "FK_TripHotelOffers_HotelOffers_HotelOfferId",
                        column: x => x.HotelOfferId,
                        principalTable: "HotelOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TripHotelOffers_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TripHotelOffers_HotelOfferId",
                table: "TripHotelOffers",
                column: "HotelOfferId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TripHotelOffers");
        }
    }
}
