using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using taifi_travel_back.Data;
using taifi_travel_back.Models;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api")]
    public class ClientsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("clients")]
        public async Task<IActionResult> GetClients([FromQuery] bool? is_archived)
        {
            var query = _context.ClientProfiles
                .AsNoTracking()
                .Include(c => c.Account)
                .Include(c => c.Applications)
                .AsQueryable();

            if (is_archived.HasValue)
            {
                query = query.Where(c => c.IsArchived == is_archived.Value);
            }

            var clients = await query
                .Select(c => new
                {
                    Id = c.Id,
                    Name = c.FirstName + " " + c.LastName,
                    Cin = c.CinNumber,
                    Sex = c.Sex,
                    DateOfBirth = c.DateOfBirth,
                    Email = c.Account != null ? c.Account.Email : null,
                    Phone = c.Account != null ? c.Account.PhoneNumber : null,
                    Campaign = c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.Trip != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.Trip!.Title : null : null,
                    TripId = c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.TripId : null,
                    FileStatus = c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? (c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.FinalValidation ? "Validated" : "Pending") : "Unverified",
                    Paid = (c.PaymentLogs.Where(p => p.TripId == (c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.TripId : null)).Sum(p => (decimal?)p.Amount) ?? 0) + (c.HotelPaymentLogs.Where(p => p.TripId == (c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.TripId : null)).Sum(p => (decimal?)p.Amount) ?? 0),
                    TotalPrice = (c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null && c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.Trip != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.Trip!.Price : 0) + (c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null && c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.HotelOffer != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.HotelOffer!.Price : 0),
                    HasPassport = c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.PassportDeposited : false,
                    HasPhoto = c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.PhotoDeposited : false,
                    HasCertificate = c.Applications.OrderByDescending(a => a.Id).FirstOrDefault() != null ? c.Applications.OrderByDescending(a => a.Id).FirstOrDefault()!.CertificateDeposited : false,
                    IsArchived = c.IsArchived,
                    IsFromWebsite = c.IsFromWebsite
                })
                .ToListAsync();

            return Ok(clients);
        }

        [HttpPost("save-client")]
        public async Task<IActionResult> SaveClient([FromBody] SaveClientRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CinNumber))
                return BadRequest(new { status = "error", message = "Error: CIN is required." });

            bool cinExists = await _context.ClientProfiles.AnyAsync(c => c.CinNumber != null && c.CinNumber.ToLower() == request.CinNumber.ToLower());
            if (cinExists)
                return BadRequest(new { status = "error", message = $"Error: The CIN '{request.CinNumber}' is already registered in the database!" });

            int? parsedTripId = null;
            if (int.TryParse(request.TripId, out var tid) && tid > 0) parsedTripId = tid;

            var trip = parsedTripId.HasValue ? await _context.Trips.FindAsync(parsedTripId.Value) : null;
            var appType = trip?.TripType ?? request.ApplicationType ?? "Omra";

            if (appType == "Hajj")
            {
                if (request.Sex?.ToLower() == "female")
                    return BadRequest("Hajj rules: Females are not allowed for this specific visa type currently.");

                if (!string.IsNullOrWhiteSpace(request.DateOfBirth))
                {
                    if (DateTime.TryParse(request.DateOfBirth, out var dobVal))
                    {
                        var age = DateTime.UtcNow.Year - dobVal.Year;
                        if (dobVal.Date > DateTime.UtcNow.AddYears(-age)) age--;
                        if (age < 25 || age > 48)
                            return BadRequest("Hajj rules: Age must be between 25 and 48.");
                    }
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int? parsedHotelId = null;
                if (int.TryParse(request.HotelOptionId, out var hid) && hid > 0) parsedHotelId = hid;

                DateTime? dob = null;
                if (!string.IsNullOrWhiteSpace(request.DateOfBirth))
                {
                    if (DateTime.TryParse(request.DateOfBirth, out var d)) dob = d.ToUniversalTime();
                }

                var clientProfile = await _context.ClientProfiles
                    .FirstOrDefaultAsync(c => c.CinNumber == request.CinNumber);

                if (clientProfile == null)
                {
                    int? accountId = request.UserAccountId;
                    
                    if (!accountId.HasValue)
                    {
                        var userAccount = new UserAccount
                        {
                            Email = request.Email,
                            PhoneNumber = request.PhoneNumber,
                            ContactValid = true
                        };
                        _context.UserAccounts.Add(userAccount);
                        await _context.SaveChangesAsync();
                        accountId = userAccount.Id;
                    }

                    clientProfile = new ClientProfile
                    {
                        AccountId = accountId,
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                        Sex = request.Sex,
                        DateOfBirth = dob,
                        CinNumber = request.CinNumber,
                        CreatedByWorkerId = request.CreatedByWorkerId,
                        Notes = request.Notes,
                        IsFromWebsite = request.IsFromWebsite ?? false
                    };
                    _context.ClientProfiles.Add(clientProfile);
                    await _context.SaveChangesAsync();
                }
                else if (request.UserAccountId.HasValue && clientProfile.AccountId != request.UserAccountId)
                {
                    clientProfile.AccountId = request.UserAccountId;
                    await _context.SaveChangesAsync();
                }

                var application = new Application
                {
                    ClientId = clientProfile.Id,
                    TripId = parsedTripId,
                    HotelOfferId = parsedHotelId,
                    ApplicationType = appType,
                    CreatedByWorkerId = request.CreatedByWorkerId,
                    PassportDeposited = request.PassportDeposited ?? false,
                    PhotoDeposited = request.PhotoDeposited ?? false,
                    CertificateDeposited = request.CertificateDeposited ?? false
                };
                _context.Applications.Add(application);
                await _context.SaveChangesAsync();

                if (request.AmountPaid.HasValue && request.AmountPaid.Value > 0)
                {
                    _context.PaymentLogs.Add(new PaymentLog
                    {
                        ClientId = clientProfile.Id,
                        TripId = parsedTripId,
                        CreatedByWorkerId = request.CreatedByWorkerId,
                        Amount = request.AmountPaid.Value,
                        PaymentDate = DateTime.UtcNow
                    });
                }
                
                if (request.HotelAmountPaid.HasValue && request.HotelAmountPaid.Value > 0)
                {
                    _context.HotelPaymentLogs.Add(new HotelPaymentLog
                    {
                        ClientId = clientProfile.Id,
                        TripId = parsedTripId,
                        CreatedByWorkerId = request.CreatedByWorkerId,
                        Amount = request.HotelAmountPaid.Value,
                        PaymentDate = DateTime.UtcNow
                    });
                }
                
                if (appType == "Hajj") 
                {
                    var age = 0;
                    if (dob.HasValue)
                    {
                        age = DateTime.UtcNow.Year - dob.Value.Year;
                        if (dob.Value.Date > DateTime.UtcNow.AddYears(-age)) age--;
                    }

                    _context.HajjDetails.Add(new HajjDetails {
                        ApplicationId = application.Id,
                        CalculatedAge = age,
                        WorkerRole = request.WorkerRole,
                        TestStatus = "Pending"
                    });
                }
                else if (appType == "Omra")
                {
                    _context.OmraDetails.Add(new OmraDetails {
                        ApplicationId = application.Id
                    });
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { ClientId = clientProfile.Id, ApplicationId = application.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { status = "error", message = "An error occurred while saving the client: " + ex.InnerException?.Message ?? ex.Message });
            }
        }

        [HttpPost("update-client/{id}")]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] UpdateClientRequest request)
        {
            var application = await _context.Applications
                .Include(a => a.Client)
                .ThenInclude(c => c!.Account)
                .Include(a => a.Trip)
                .Include(a => a.HotelOffer)
                .OrderByDescending(a => a.Id)
                .FirstOrDefaultAsync(a => a.ClientId == id);

            var clientProfile = application?.Client ?? await _context.ClientProfiles.Include(c => c.Account).FirstOrDefaultAsync(c => c.Id == id);
            if (clientProfile == null) return NotFound("Client not found.");

            // Update basic fields
            if (request.FirstName != null) clientProfile.FirstName = request.FirstName;
            if (request.LastName != null) clientProfile.LastName = request.LastName;
            if (request.Sex != null) clientProfile.Sex = request.Sex;
            if (request.CinNumber != null) clientProfile.CinNumber = request.CinNumber;
            
            if (request.DateOfBirth != null) {
                if (DateTime.TryParse(request.DateOfBirth, out var d)) clientProfile.DateOfBirth = d.ToUniversalTime();
            }

            if (clientProfile.Account != null) {
                if (request.ContactValid.HasValue) clientProfile.Account.ContactValid = request.ContactValid.Value;
                if (request.Email != null) clientProfile.Account.Email = request.Email;
                if (request.PhoneNumber != null) clientProfile.Account.PhoneNumber = request.PhoneNumber;
            }

                        if (request.IsArchived.HasValue) {
                if (request.IsArchived.Value == true) {
                    var workerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    if (!int.TryParse(workerIdClaim, out int workerId))
                        return Unauthorized(new { status = "error", message = "Unauthorized access." });

                    var worker = await _context.WorkerAccounts.FindAsync(workerId);
                    if (worker == null || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(worker.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, worker.PasswordHash))
                        return BadRequest(new { status = "error", message = "Mot de passe incorrect pour l'archivage." });
                }
                clientProfile.IsArchived = request.IsArchived.Value;
            }

            if (request.Notes != null) {
                clientProfile.Notes = request.Notes;
            }

            if (application == null && request.TripId.HasValue) {
                var newTrip = await _context.Trips.FindAsync(request.TripId.Value);
                if (newTrip != null) {
                    application = new Application {
                        ClientId = id,
                        TripId = request.TripId.Value,
                        ApplicationType = newTrip.TripType,
                        PassportDeposited = request.PassportDeposited ?? false,
                        PhotoDeposited = request.PhotoDeposited ?? false,
                        CertificateDeposited = request.CertificateDeposited ?? false
                    };
                    _context.Applications.Add(application);
                    if (application.ApplicationType == "Hajj") {
                        _context.HajjDetails.Add(new HajjDetails { Application = application, CalculatedAge = 0, WorkerRole = request.WorkerRole ?? "3amil", TestStatus = request.TestStatus ?? "Pending" });
                    } else {
                        _context.OmraDetails.Add(new OmraDetails { Application = application });
                    }
                }
            } else if (application != null) {
                if (request.HotelOptionId != null) {
                    if (int.TryParse(request.HotelOptionId, out var hid) && hid > 0) application.HotelOfferId = hid;
                    else if (request.HotelOptionId == "") application.HotelOfferId = null;
                }

                if (request.PassportDeposited.HasValue) application.PassportDeposited = request.PassportDeposited.Value;
                if (request.PhotoDeposited.HasValue) application.PhotoDeposited = request.PhotoDeposited.Value;
                if (request.CertificateDeposited.HasValue) application.CertificateDeposited = request.CertificateDeposited.Value;

                // Update Trip Type if changed
                if (request.TripId.HasValue && application.TripId != request.TripId.Value) {
                    application.TripId = request.TripId;
                    var newTrip = await _context.Trips.FindAsync(request.TripId.Value);
                    if (newTrip != null) {
                        application.ApplicationType = newTrip.TripType;
                    } else if (!string.IsNullOrEmpty(request.ApplicationType)) {
                        application.ApplicationType = request.ApplicationType;
                    }
                    
                    var existingHajj = await _context.HajjDetails.FirstOrDefaultAsync(h => h.ApplicationId == application.Id);
                    var existingOmra = await _context.OmraDetails.FirstOrDefaultAsync(o => o.ApplicationId == application.Id);
                    if (existingHajj != null) _context.HajjDetails.Remove(existingHajj);
                    if (existingOmra != null) _context.OmraDetails.Remove(existingOmra);

                    if (application.ApplicationType == "Hajj") {
                        var age = 0;
                        if (clientProfile.DateOfBirth.HasValue) {
                            var dob = clientProfile.DateOfBirth.Value;
                            age = DateTime.UtcNow.Year - dob.Year;
                            if (dob.Date > DateTime.UtcNow.AddYears(-age)) age--;
                        }
                        _context.HajjDetails.Add(new HajjDetails { ApplicationId = application.Id, CalculatedAge = age, WorkerRole = request.WorkerRole ?? "3amil", TestStatus = request.TestStatus ?? "Pending" });
                    } else if (application.ApplicationType == "Omra") {
                        _context.OmraDetails.Add(new OmraDetails { ApplicationId = application.Id });
                    }
                } else {
                    if (application.ApplicationType == "Hajj") {
                        var hajjDetails = await _context.HajjDetails.FirstOrDefaultAsync(h => h.ApplicationId == application.Id);
                        if (hajjDetails != null) {
                            if (request.WorkerRole != null) hajjDetails.WorkerRole = request.WorkerRole;
                            if (request.TestStatus != null) hajjDetails.TestStatus = request.TestStatus;
                        }
                    }
                }

                await EvaluateFinalValidation(application);
            }

            await _context.SaveChangesAsync();
            return Ok(new { application?.FinalValidation });
        }

        [HttpPost("add-payment/{clientId}")]
        public async Task<IActionResult> AddPayment(int clientId, [FromBody] AddPaymentRequest request)
        {
            var application = await _context.Applications
                .Include(a => a.Trip)
                .Include(a => a.HotelOffer)
                .OrderByDescending(a => a.Id)
                .FirstOrDefaultAsync(a => a.ClientId == clientId && a.TripId == request.TripId);

            if (application == null) return NotFound("Application not found.");

            if (request.IsHotel)
            {
                if (application.HotelOffer == null) return BadRequest("No hotel offer associated.");
                
                decimal totalPaid = await _context.HotelPaymentLogs.Where(p => p.ClientId == clientId && p.TripId == request.TripId).SumAsync(p => p.Amount);
                
                if (request.Amount > 0)
                {
                    if (totalPaid + request.Amount > application.HotelOffer.Price)
                        return BadRequest("Amount exceeds remaining hotel balance.");
                }
                else if (request.Amount < 0)
                {
                    if (Math.Abs(request.Amount) > totalPaid)
                        return BadRequest("Refund exceeds total hotel paid amount.");
                }

                _context.HotelPaymentLogs.Add(new HotelPaymentLog
                {
                    ClientId = clientId,
                    TripId = request.TripId,
                    CreatedByWorkerId = request.CreatedByWorkerId,
                    Amount = request.Amount,
                    PaymentDate = DateTime.UtcNow
                });
            }
            else
            {
                if (application.Trip == null) return BadRequest("No trip associated.");

                decimal totalPaid = await _context.PaymentLogs.Where(p => p.ClientId == clientId && p.TripId == request.TripId).SumAsync(p => p.Amount);

                if (request.Amount > 0)
                {
                    if (totalPaid + request.Amount > application.Trip.Price)
                        return BadRequest("Amount exceeds remaining trip balance.");
                }
                else if (request.Amount < 0)
                {
                    if (Math.Abs(request.Amount) > totalPaid)
                        return BadRequest("Refund exceeds total trip paid amount.");
                }

                _context.PaymentLogs.Add(new PaymentLog
                {
                    ClientId = clientId,
                    TripId = request.TripId,
                    CreatedByWorkerId = request.CreatedByWorkerId,
                    Amount = request.Amount,
                    PaymentDate = DateTime.UtcNow
                });
            }

            // Save the payment log first so it's included in the sum
            await _context.SaveChangesAsync();
            
            // Evaluate and save the final validation status
            await EvaluateFinalValidation(application);
            await _context.SaveChangesAsync();
            
            return Ok();
        }

        [HttpGet("clients/{id}/details")]
        public async Task<IActionResult> GetClientDetails(int id, [FromQuery] string tab)
        {
            var application = await _context.Applications
                .AsNoTracking()
                .Include(a => a.Client)
                .ThenInclude(c => c!.Account)
                .Include(a => a.Trip)
                .Include(a => a.HotelOffer)
                    .ThenInclude(ho => ho!.Hotel)
                .Include(a => a.HajjDetails)
                .Include(a => a.OmraDetails)
                .OrderByDescending(a => a.Id)
                .FirstOrDefaultAsync(a => a.ClientId == id);

            var clientProfile = application?.Client ?? await _context.ClientProfiles
                .AsNoTracking()
                .Include(c => c.Account)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (clientProfile == null) return NotFound("Client not found.");

            if (tab == "identity")
            {
                return Ok(new
                {
                    name = clientProfile.FirstName + " " + clientProfile.LastName,
                    cin = clientProfile.CinNumber,
                    campaign = application?.Trip?.Title,
                    applicationType = application?.ApplicationType,
                    hajjDetails = application?.HajjDetails != null ? new { 
                        application!.HajjDetails.WorkerRole, 
                        application!.HajjDetails.CalculatedAge, 
                        application!.HajjDetails.TestStatus 
                    } : null,
                    omraDetails = application?.OmraDetails != null ? new { } : null,
                    applicationId = application?.Id,
                    passportDeposited = application?.PassportDeposited ?? false,
                    photoDeposited = application?.PhotoDeposited ?? false,
                    certificateDeposited = application?.CertificateDeposited ?? false,
                    finalValidation = application?.FinalValidation ?? false
                });
            }
            else if (tab == "contact")
            {
                return Ok(new
                {
                    email = clientProfile.Account?.Email,
                    phone = clientProfile.Account?.PhoneNumber,
                    contactValid = clientProfile.Account?.ContactValid
                });
            }
            else if (tab == "hotel")
            {
                int? appTripId = application?.TripId;
                var hotelLogs = await _context.HotelPaymentLogs
                    .AsNoTracking()
                    .Where(p => p.ClientId == id && p.TripId == appTripId)
                    .OrderByDescending(p => p.PaymentDate)
                    .ToListAsync();

                decimal hotelPrice = application?.HotelOffer?.Price ?? 0;
                decimal hotelPaid = hotelLogs.Sum(p => p.Amount);

                return Ok(new
                {
                    tripId = appTripId,
                    hotelId = application?.HotelOffer?.HotelId,
                    hotelName = application?.HotelOffer?.Hotel?.Name,
                    hotelCity = application?.HotelOffer?.Hotel?.City,
                    roomCapacity = application?.HotelOffer?.Capacity,
                    price = hotelPrice,
                    paid = hotelPaid,
                    remaining = hotelPrice - hotelPaid,
                    ledger = hotelLogs.Select(l => new { date = l.PaymentDate, amount = l.Amount })
                });
            }
            else if (tab == "travel")
            {
                int? appTripId = application?.TripId;
                
                var tripLogs = await _context.PaymentLogs
                    .AsNoTracking()
                    .Where(p => p.ClientId == id && p.TripId == appTripId)
                    .OrderByDescending(p => p.PaymentDate)
                    .ToListAsync();

                decimal tripPrice = application?.Trip?.Price ?? 0;
                decimal tripPaid = tripLogs.Sum(p => p.Amount);
                
                return Ok(new
                {
                    tripId = appTripId,
                    title = application?.Trip?.Title,
                    tripType = application?.Trip?.TripType,
                    departureDate = application?.Trip?.DepartureDate?.ToString("yyyy-MM-dd"),
                    returnDate = application?.Trip?.ReturnDate?.ToString("yyyy-MM-dd"),
                    price = tripPrice,
                    paid = tripPaid,
                    remaining = tripPrice - tripPaid,
                    ledger = tripLogs.Select(l => new { date = l.PaymentDate, amount = l.Amount })
                });
            }

            return BadRequest("Invalid tab");
        }

        [HttpGet("clients/{id}/full-details")]
        public async Task<IActionResult> GetClientFullDetails(int id)
        {
            var application = await _context.Applications
                .AsNoTracking()
                .Include(a => a.Client)
                .ThenInclude(c => c!.Account)
                .Include(a => a.HotelOffer)
                .Include(a => a.HajjDetails)
                .OrderByDescending(a => a.Id)
                .FirstOrDefaultAsync(a => a.ClientId == id);

            var clientProfile = application?.Client ?? await _context.ClientProfiles
                .AsNoTracking()
                .Include(c => c.Account)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (clientProfile == null) return NotFound("Client not found.");

            var hajj = application?.HajjDetails;

            return Ok(new
            {
                firstName = clientProfile.FirstName ?? "",
                lastName = clientProfile.LastName ?? "",
                cinNumber = clientProfile.CinNumber ?? "",
                sex = clientProfile.Sex ?? "",
                dateOfBirth = clientProfile.DateOfBirth?.ToString("yyyy-MM-dd") ?? "",
                email = clientProfile.Account?.Email ?? "",
                phoneNumber = clientProfile.Account?.PhoneNumber ?? "",
                hotelOptionId = application?.HotelOfferId?.ToString() ?? "",
                tripId = application?.TripId?.ToString() ?? "",
                applicationType = application?.ApplicationType ?? "",
                workerRole = hajj?.WorkerRole ?? "",
                testStatus = hajj?.TestStatus ?? "",
                notes = clientProfile.Notes ?? "",
                passportDeposited = application?.PassportDeposited ?? false,
                photoDeposited = application?.PhotoDeposited ?? false,
                certificateDeposited = application?.CertificateDeposited ?? false,
                finalValidation = application?.FinalValidation ?? false
            });
        }

                [HttpDelete("delete-client/{id}")]
        public async Task<IActionResult> DeleteClient(int id, [FromBody] DeleteClientRequest req)
        {
            var workerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(workerIdClaim, out int workerId))
                return Unauthorized(new { status = "error", message = "Unauthorized access." });

            var worker = await _context.WorkerAccounts.FindAsync(workerId);
            if (worker == null || string.IsNullOrEmpty(req.Password) || string.IsNullOrEmpty(worker.PasswordHash) || !BCrypt.Net.BCrypt.Verify(req.Password, worker.PasswordHash))
                return BadRequest(new { status = "error", message = "Mot de passe incorrect." });

            var client = await _context.ClientProfiles.FindAsync(id);
            if (client == null) return NotFound(new { status = "error", message = "Client not found." });

            _context.ClientProfiles.Remove(client);
            await _context.SaveChangesAsync();
            return Ok(new { status = "success" });
        }

        [HttpPut("reactivate-client/{id}")]
        public async Task<IActionResult> ReactivateClient(int id)
        {
            var client = await _context.ClientProfiles.FindAsync(id);
            if (client == null) return NotFound("Client not found.");

            client.IsArchived = false;

            await _context.SaveChangesAsync();
            
            return Ok(new { status = "success", message = "Client reactivated successfully." });
        }
        private async Task EvaluateFinalValidation(Application application)
        {
            if (application == null) return;

            bool docsValid = application.PassportDeposited && application.PhotoDeposited && application.CertificateDeposited;

            decimal totalTripPaid = await _context.PaymentLogs.Where(p => p.ClientId == application.ClientId && p.TripId == application.TripId).SumAsync(p => p.Amount);
            decimal totalHotelPaid = await _context.HotelPaymentLogs.Where(p => p.ClientId == application.ClientId && p.TripId == application.TripId).SumAsync(p => p.Amount);

            bool tripPaid = application.Trip == null || application.Trip.Price == 0 || totalTripPaid >= application.Trip.Price;
            bool hotelPaid = application.HotelOffer == null || application.HotelOffer.Price == 0 || totalHotelPaid >= application.HotelOffer.Price;

            application.FinalValidation = docsValid && tripPaid && hotelPaid;
        }
    }

    public class SaveClientRequest
    {
        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Sex { get; set; }
        public string? DateOfBirth { get; set; }
        public string? CinNumber { get; set; }
        public string? TripId { get; set; }

        public string? HotelOptionId { get; set; }
        
        public string? ApplicationType { get; set; }
        public int? CreatedByWorkerId { get; set; }
        public bool? IsFromWebsite { get; set; }
        public string? WorkerRole { get; set; }
        public string? Notes { get; set; }
        public bool? PassportDeposited { get; set; }
        public bool? PhotoDeposited { get; set; }
        public bool? CertificateDeposited { get; set; }
        public decimal? AmountPaid { get; set; }
        public decimal? HotelAmountPaid { get; set; }
        public int? UserAccountId { get; set; }
    }

    public class UpdateClientRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Sex { get; set; }
        public string? DateOfBirth { get; set; }
        public string? CinNumber { get; set; }
        
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        
        public string? HotelOptionId { get; set; }

        public bool? PassportDeposited { get; set; }
        public bool? PhotoDeposited { get; set; }
        public bool? CertificateDeposited { get; set; }
        public bool? FinalValidation { get; set; }
        public bool? ContactValid { get; set; }
        public string? WorkerRole { get; set; }
        public string? TestStatus { get; set; }
        public int? TripId { get; set; }
        public string? ApplicationType { get; set; }
        public bool? IsArchived { get; set; }
        public string? Password { get; set; }
        public string? Notes { get; set; }
    }

    public class AddPaymentRequest
    {
        public int? TripId { get; set; }
        public decimal Amount { get; set; }
        public bool IsHotel { get; set; }
        public int? CreatedByWorkerId { get; set; }
        }

    public class DeleteClientRequest
    {
        public string Password { get; set; }
    }
}



