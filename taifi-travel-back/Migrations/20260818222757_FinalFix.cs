using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace taifi_travel_back.Migrations
{
    /// <inheritdoc />
    public partial class FinalFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Hotels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hotels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    EmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    PhoneVerified = table.Column<bool>(type: "boolean", nullable: false),
                    ContactValid = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkerAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: true),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false, defaultValue: "Agent"),
                    PermissionsJson = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkerAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HotelOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HotelId = table.Column<int>(type: "integer", nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false, defaultValue: 4),
                    Price = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HotelOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HotelOffers_Hotels_HotelId",
                        column: x => x.HotelId,
                        principalTable: "Hotels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
                    CreatedByWorkerId = table.Column<int>(type: "integer", nullable: true),
                    FirstName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "text", nullable: true),
                    Sex = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CinNumber = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientProfiles_UserAccounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClientProfiles_WorkerAccounts_CreatedByWorkerId",
                        column: x => x.CreatedByWorkerId,
                        principalTable: "WorkerAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedByWorkerId = table.Column<int>(type: "integer", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: true),
                    TripType = table.Column<string>(type: "text", nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    DepartureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false, defaultValue: "Upcoming")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trips_WorkerAccounts_CreatedByWorkerId",
                        column: x => x.CreatedByWorkerId,
                        principalTable: "WorkerAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    TripId = table.Column<int>(type: "integer", nullable: true),
                    HotelOfferId = table.Column<int>(type: "integer", nullable: true),
                    CreatedByWorkerId = table.Column<int>(type: "integer", nullable: true),
                    ApplicationType = table.Column<string>(type: "text", nullable: true),
                    QrCodeId = table.Column<string>(type: "text", nullable: true),
                    ExactAmountPaid = table.Column<decimal>(type: "numeric", nullable: false),
                    PassportDeposited = table.Column<bool>(type: "boolean", nullable: false),
                    PhotoDeposited = table.Column<bool>(type: "boolean", nullable: false),
                    CertificateDeposited = table.Column<bool>(type: "boolean", nullable: false),
                    FinalValidation = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applications_ClientProfiles_ClientId",
                        column: x => x.ClientId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Applications_HotelOffers_HotelOfferId",
                        column: x => x.HotelOfferId,
                        principalTable: "HotelOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Applications_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Applications_WorkerAccounts_CreatedByWorkerId",
                        column: x => x.CreatedByWorkerId,
                        principalTable: "WorkerAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "HotelPaymentLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    TripId = table.Column<int>(type: "integer", nullable: true),
                    CreatedByWorkerId = table.Column<int>(type: "integer", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HotelPaymentLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HotelPaymentLogs_ClientProfiles_ClientId",
                        column: x => x.ClientId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HotelPaymentLogs_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HotelPaymentLogs_WorkerAccounts_CreatedByWorkerId",
                        column: x => x.CreatedByWorkerId,
                        principalTable: "WorkerAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PaymentLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    TripId = table.Column<int>(type: "integer", nullable: true),
                    CreatedByWorkerId = table.Column<int>(type: "integer", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentLogs_ClientProfiles_ClientId",
                        column: x => x.ClientId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaymentLogs_Trips_TripId",
                        column: x => x.TripId,
                        principalTable: "Trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaymentLogs_WorkerAccounts_CreatedByWorkerId",
                        column: x => x.CreatedByWorkerId,
                        principalTable: "WorkerAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "HajjDetails",
                columns: table => new
                {
                    ApplicationId = table.Column<int>(type: "integer", nullable: false),
                    WorkerRole = table.Column<string>(type: "text", nullable: true),
                    CalculatedAge = table.Column<int>(type: "integer", nullable: true),
                    TestStatus = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HajjDetails", x => x.ApplicationId);
                    table.ForeignKey(
                        name: "FK_HajjDetails_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OmraDetails",
                columns: table => new
                {
                    ApplicationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OmraDetails", x => x.ApplicationId);
                    table.ForeignKey(
                        name: "FK_OmraDetails_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "WorkerAccounts",
                columns: new[] { "Id", "FullName", "IsDisabled", "PasswordHash", "PermissionsJson", "Role", "Username" },
                values: new object[,]
                {
                    { 1, "System Admin", false, "$2a$11$EiJjvPDoTvYgPaz7lVfJaOiKE5ab6p1w9zhInz3uDJfs117vLfTky", null, "Admin", "admin" },
                    { 2, "Default Agent", false, "$2a$11$jJgakwj.rTTCY7XTYTKB3uVqQkNKezkkgHwerDMmse7MoDi2C55Zi", null, "Agent", "agent" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_ClientId",
                table: "Applications",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_CreatedByWorkerId",
                table: "Applications",
                column: "CreatedByWorkerId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_HotelOfferId",
                table: "Applications",
                column: "HotelOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_QrCodeId",
                table: "Applications",
                column: "QrCodeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TripId",
                table: "Applications",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientProfiles_AccountId",
                table: "ClientProfiles",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientProfiles_CinNumber",
                table: "ClientProfiles",
                column: "CinNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClientProfiles_CreatedByWorkerId",
                table: "ClientProfiles",
                column: "CreatedByWorkerId");

            migrationBuilder.CreateIndex(
                name: "IX_HotelOffers_HotelId",
                table: "HotelOffers",
                column: "HotelId");

            migrationBuilder.CreateIndex(
                name: "IX_HotelPaymentLogs_ClientId",
                table: "HotelPaymentLogs",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_HotelPaymentLogs_CreatedByWorkerId",
                table: "HotelPaymentLogs",
                column: "CreatedByWorkerId");

            migrationBuilder.CreateIndex(
                name: "IX_HotelPaymentLogs_TripId",
                table: "HotelPaymentLogs",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentLogs_ClientId",
                table: "PaymentLogs",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentLogs_CreatedByWorkerId",
                table: "PaymentLogs",
                column: "CreatedByWorkerId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentLogs_TripId",
                table: "PaymentLogs",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_Trips_CreatedByWorkerId",
                table: "Trips",
                column: "CreatedByWorkerId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkerAccounts_Username",
                table: "WorkerAccounts",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HajjDetails");

            migrationBuilder.DropTable(
                name: "HotelPaymentLogs");

            migrationBuilder.DropTable(
                name: "OmraDetails");

            migrationBuilder.DropTable(
                name: "PaymentLogs");

            migrationBuilder.DropTable(
                name: "Applications");

            migrationBuilder.DropTable(
                name: "ClientProfiles");

            migrationBuilder.DropTable(
                name: "HotelOffers");

            migrationBuilder.DropTable(
                name: "Trips");

            migrationBuilder.DropTable(
                name: "UserAccounts");

            migrationBuilder.DropTable(
                name: "Hotels");

            migrationBuilder.DropTable(
                name: "WorkerAccounts");
        }
    }
}
