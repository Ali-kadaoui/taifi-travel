using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taifi_travel_back.Data;
using taifi_travel_back.Models;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api")]
    public class TripsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/trips?archived=false  (activeOnly kept for backward compat)
        [HttpGet("trips")]
        public async Task<IActionResult> GetTrips([FromQuery] bool? archived, [FromQuery] bool? activeOnly)
        {
            var query = _context.Trips
                .AsNoTracking()
                .Include(t => t.Applications)
                .AsQueryable();

            // Explicit archived filter
            if (archived.HasValue)
            {
                query = query.Where(t => t.IsArchived == archived.Value);
            }
            // Legacy activeOnly support
            else if (activeOnly.HasValue && activeOnly.Value)
            {
                query = query.Where(t => !t.IsArchived);
            }

            var trips = await query
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    type = t.TripType,
                    t.Price,
                    t.About,
                    t.DepartureDate,
                    t.ReturnDate,
                    t.IsArchived,
                    ClientsCount = t.Applications.Count,
                    IsFull = t.IsFull,
                    RevenueCollected = (t.PaymentLogs.Sum(p => (decimal?)p.Amount) ?? 0) + (t.HotelPaymentLogs.Sum(p => (decimal?)p.Amount) ?? 0),
                    IsExpired = t.ReturnDate.HasValue && t.ReturnDate.Value < DateOnly.FromDateTime(DateTime.UtcNow),
                    ImagesBase64 = t.ImagesBase64,
                    HotelOfferIds = t.TripHotelOffers.Select(tho => tho.HotelOfferId).ToList()
                })
                .ToListAsync();

            return Ok(trips);
        }

        [HttpGet("trips/{id}")]
        public async Task<IActionResult> GetTripById(int id)
        {
            var trip = await _context.Trips
                .AsNoTracking()
                .Include(t => t.Applications)
                .Include(t => t.TripHotelOffers)
                    .ThenInclude(tho => tho.HotelOffer)
                        .ThenInclude(ho => ho.Hotel)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trip == null) return NotFound("Trip not found.");

            return Ok(new
            {
                trip.Id,
                trip.Title,
                type = trip.TripType,
                trip.Price,
                trip.About,
                DepartureDate = trip.DepartureDate?.ToString("yyyy-MM-dd"),
                ReturnDate = trip.ReturnDate?.ToString("yyyy-MM-dd"),
                trip.IsArchived,
                trip.IsFull,
                ClientsCount = trip.Applications.Count,
                IsExpired = trip.ReturnDate.HasValue && trip.ReturnDate.Value < DateOnly.FromDateTime(DateTime.UtcNow),
                ImagesBase64 = trip.ImagesBase64,
                HotelOffers = trip.TripHotelOffers.Select(tho => new {
                    tho.HotelOffer?.Id,
                    tho.HotelOffer?.Capacity,
                    tho.HotelOffer?.Price,
                    HotelName = tho.HotelOffer?.Hotel?.Name,
                    HotelCity = tho.HotelOffer?.Hotel?.City,
                    HotelId = tho.HotelOffer?.Hotel?.Id,
                    ImagesBase64 = tho.HotelOffer?.Hotel?.ImagesBase64
                }).ToList()
            });
        }

        [HttpPost("create-trip")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> CreateTrip([FromBody] TripRequest request)
        {
            try
            {
                DateOnly? depDate = null;
                if (!string.IsNullOrWhiteSpace(request.DepartureDate) && request.DepartureDate != "TBD")
                {
                    if (DateOnly.TryParse(request.DepartureDate, out var d)) depDate = d;
                }

                DateOnly? retDate = null;
                if (!string.IsNullOrWhiteSpace(request.ReturnDate) && request.ReturnDate != "TBD")
                {
                    if (DateOnly.TryParse(request.ReturnDate, out var r)) retDate = r;
                }

                int? workerId = request.CreatedByWorkerId;
                var workerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(workerIdClaim, out int id)) {
                    workerId = id;
                }

                var trip = new Trip
                {
                    Title = request.Title,
                    TripType = request.TripType,
                    Price = request.Price ?? 0,
                    About = request.About,
                    DepartureDate = depDate,
                    ReturnDate = retDate,
                    CreatedByWorkerId = workerId,
                    IsArchived = false
                };

                if (request.ImagesBase64 != null)
                {
                    trip.ImagesBase64 = request.ImagesBase64.Take(5).ToList();
                }

                _context.Trips.Add(trip);
                await _context.SaveChangesAsync();
                return Ok(trip);
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "error", message = ex.Message });
            }
        }

        [HttpPost("update-trip/{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UpdateTrip(int id, [FromBody] TripRequest request)
        {
            try
            {
                var trip = await _context.Trips.FindAsync(id);
                if (trip == null) return NotFound(new { status = "error", message = "Trip not found." });

                if (request.Title != null) trip.Title = request.Title;
                if (request.TripType != null) trip.TripType = request.TripType;
                if (request.Price.HasValue) trip.Price = request.Price.Value;
                if (request.About != null) trip.About = request.About;

                if (!string.IsNullOrWhiteSpace(request.DepartureDate) && request.DepartureDate != "TBD")
                {
                    if (DateOnly.TryParse(request.DepartureDate, out var d)) trip.DepartureDate = d;
                }

                if (!string.IsNullOrWhiteSpace(request.ReturnDate) && request.ReturnDate != "TBD")
                {
                    if (DateOnly.TryParse(request.ReturnDate, out var r)) trip.ReturnDate = r;
                }

                if (request.ImagesBase64 != null)
                {
                    if (request.ImagesBase64.Count == 0)
                    {
                        trip.ImagesBase64 = null;
                    }
                    else
                    {
                        trip.ImagesBase64 = request.ImagesBase64.Take(5).ToList();
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(trip);
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "error", message = ex.Message });
            }
        }

        // PUT /api/archive-trip/{id}  â€” marks trip and all its clients as archived
                [HttpPut("archive-trip/{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> ArchiveTrip(int id, [FromBody] DeleteTripRequest req)
        {
            var workerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(workerIdClaim, out int workerId))
                return Unauthorized(new { status = "error", message = "Unauthorized access." });

            var worker = await _context.WorkerAccounts.FindAsync(workerId);
            if (worker == null || string.IsNullOrEmpty(req.Password) || string.IsNullOrEmpty(worker.PasswordHash) || !BCrypt.Net.BCrypt.Verify(req.Password, worker.PasswordHash))
                return BadRequest(new { status = "error", message = "Mot de passe incorrect." });

            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound(new { status = "error", message = "Trip not found." });

            trip.IsArchived = true;

            var applications = await _context.Applications
                .Include(a => a.Client)
                .Where(a => a.TripId == trip.Id)
                .ToListAsync();

            foreach (var app in applications)
            {
                if (app.Client != null)
                    app.Client.IsArchived = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { status = "success", message = "Trip and associated clients archived." });
        }

        // POST /api/delete-trip/{id}  — truly deletes the trip from database
        [HttpPost("delete-trip/{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> DeleteTrip(int id, [FromBody] DeleteTripRequest req)
        {
            var workerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(workerIdClaim, out int workerId))
                return Unauthorized(new { status = "error", message = "Unauthorized access." });

            var worker = await _context.WorkerAccounts.FindAsync(workerId);
            if (worker == null || string.IsNullOrEmpty(req.Password) || string.IsNullOrEmpty(worker.PasswordHash) || !BCrypt.Net.BCrypt.Verify(req.Password, worker.PasswordHash))
                return BadRequest(new { status = "error", message = "Mot de passe incorrect." });

            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound(new { status = "error", message = "Trip not found." });

            var applications = await _context.Applications.Where(a => a.TripId == id).ToListAsync();
            foreach (var app in applications) {
                app.TripId = null;
            }

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();
            return Ok(new { status = "success", message = "Trip deleted successfully." });
        }

                [HttpPatch("trips/{id}/toggle-full")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> ToggleTripFull(int id, [FromBody] DeleteTripRequest req)
        {
            var workerIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(workerIdClaim, out int workerId))
                return Unauthorized(new { status = "error", message = "Unauthorized access." });

            var worker = await _context.WorkerAccounts.FindAsync(workerId);
            if (worker == null || string.IsNullOrEmpty(req.Password) || string.IsNullOrEmpty(worker.PasswordHash) || !BCrypt.Net.BCrypt.Verify(req.Password, worker.PasswordHash))
                return BadRequest(new { status = "error", message = "Mot de passe incorrect." });

            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound(new { status = "error", message = "Voyage introuvable." });

            trip.IsFull = !trip.IsFull;
            await _context.SaveChangesAsync();
            return Ok(new { status = "success", isFull = trip.IsFull });
        }

        [HttpPut("reactivate-trip/{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> ReactivateTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound(new { status = "error", message = "Trip not found." });

            trip.IsArchived = false;

            var applications = await _context.Applications
                .Include(a => a.Client)
                .Where(a => a.TripId == trip.Id)
                .ToListAsync();

            foreach (var app in applications)
            {
                if (app.Client != null)
                    app.Client.IsArchived = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new { status = "success", message = "Trip and associated clients reactivated." });
        }

        [HttpPost("trips/{id}/hotel-offers/{offerId}")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> LinkHotelOffer(int id, int offerId)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound(new { status = "error", message = "Trip not found." });

            var offer = await _context.HotelOffers.FindAsync(offerId);
            if (offer == null) return NotFound(new { status = "error", message = "Hotel Offer not found." });

            var existing = await _context.TripHotelOffers.FirstOrDefaultAsync(t => t.TripId == id && t.HotelOfferId == offerId);
            if (existing != null) return BadRequest(new { status = "error", message = "Offer already linked to this trip." });

            _context.TripHotelOffers.Add(new TripHotelOffer { TripId = id, HotelOfferId = offerId });
            await _context.SaveChangesAsync();
            return Ok(new { status = "success", message = "Hotel offer linked." });
        }

        [HttpDelete("trips/{id}/hotel-offers/{offerId}")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UnlinkHotelOffer(int id, int offerId)
        {
            var link = await _context.TripHotelOffers.FirstOrDefaultAsync(t => t.TripId == id && t.HotelOfferId == offerId);
            if (link == null) return NotFound(new { status = "error", message = "Link not found." });

            _context.TripHotelOffers.Remove(link);
            await _context.SaveChangesAsync();
            return Ok(new { status = "success", message = "Hotel offer unlinked." });
        }
    }

    public class TripRequest
    {
        public string? Title { get; set; }
        public string? TripType { get; set; }
        public decimal? Price { get; set; }
        public string? About { get; set; }
        public string? DepartureDate { get; set; }
        public string? ReturnDate { get; set; }
        public int? CreatedByWorkerId { get; set; }
        public List<string>? ImagesBase64 { get; set; }
    }

    public class DeleteTripRequest
    {
        public string Password { get; set; }
    }
}



