using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taifi_travel_back.Data;
using taifi_travel_back.Models;
using System.Text.Json;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api")]
    public class PendingApplicationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PendingApplicationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("public/submit-application")]
        public async Task<IActionResult> SubmitApplication([FromBody] SaveClientRequest request)
        {
            try
            {
                if (!string.IsNullOrEmpty(request.TripId) && int.TryParse(request.TripId, out int tripId))
                {
                    var trip = await _context.Trips.FindAsync(tripId);
                    if (trip != null && trip.IsFull)
                    {
                        return BadRequest(new { success = false, message = "Désolé, ce voyage est maintenant complet." });
                    }
                }

                var payloadJson = JsonSerializer.Serialize(request, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                
                int? userAccountId = null;
                var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int parsedId))
                {
                    userAccountId = parsedId;
                }

                var pendingApp = new PendingApplication
                {
                    PayloadJson = payloadJson,
                    Status = "Pending",
                    UserAccountId = userAccountId
                };

                _context.PendingApplications.Add(pendingApp);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Application submitted successfully and is pending review." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Failed to submit application: " + ex.Message });
            }
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("public/my-applications")]
        public async Task<IActionResult> GetMyApplications()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var apps = await _context.PendingApplications
                                     .Where(p => p.UserAccountId == userId)
                                     .OrderByDescending(p => p.CreatedAt)
                                     .ToListAsync();

            // We could parse the JSON to return trip name/details so the frontend doesn't have to
            var result = apps.Select(app => {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var payload = JsonSerializer.Deserialize<SaveClientRequest>(app.PayloadJson, options);
                
                return new {
                    app.Id,
                    app.Status,
                    app.CreatedAt,
                    TripId = payload?.TripId,
                    HotelOptionId = payload?.HotelOptionId,
                    FirstName = payload?.FirstName,
                    LastName = payload?.LastName,
                    PayloadJson = app.PayloadJson
                };
            });

            return Ok(result);
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("public/my-tracking")]
        public async Task<IActionResult> GetMyTracking()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // 1. Fetch any pending applications
            var pendingApp = await _context.PendingApplications
                                           .Where(p => p.UserAccountId == userId && p.Status == "Pending")
                                           .OrderByDescending(p => p.CreatedAt)
                                           .FirstOrDefaultAsync();

            // 2. Fetch approved applications via ClientProfile
            var clientProfile = await _context.ClientProfiles
                                              .Include(c => c.Applications).ThenInclude(a => a.Trip)
                                              .Include(c => c.Applications).ThenInclude(a => a.HotelOffer).ThenInclude(h => h.Hotel)
                                              .Include(c => c.Applications).ThenInclude(a => a.HajjDetails)
                                              .Include(c => c.Applications).ThenInclude(a => a.OmraDetails)
                                              .Include(c => c.PaymentLogs)
                                              .Include(c => c.HotelPaymentLogs)
                                              .FirstOrDefaultAsync(c => c.AccountId == userId);

            var response = new
            {
                PendingApplication = pendingApp == null ? null : new
                {
                    pendingApp.Id,
                    pendingApp.Status,
                    pendingApp.CreatedAt,
                    PayloadJson = pendingApp.PayloadJson
                },
                ApprovedApplications = clientProfile == null ? null : clientProfile.Applications.Select(app => new
                {
                    app.Id,
                    app.ApplicationType,
                    app.PassportDeposited,
                    app.PhotoDeposited,
                    app.CertificateDeposited,
                    app.FinalValidation,
                    Trip = app.Trip == null ? null : new { app.Trip.Id, app.Trip.Title, app.Trip.Price, app.Trip.DepartureDate },
                    HotelOffer = app.HotelOffer == null ? null : new { app.HotelOffer.Id, HotelName = app.HotelOffer.Hotel?.Name, app.HotelOffer.Price },
                    HajjDetails = app.HajjDetails == null ? null : new { app.HajjDetails.TestStatus, app.HajjDetails.CalculatedAge, app.HajjDetails.WorkerRole },
                    OmraDetails = app.OmraDetails == null ? null : new { },
                    Payments = clientProfile.PaymentLogs.Where(p => p.TripId == app.TripId).Select(p => new { p.Amount, p.PaymentDate }),
                    TotalPaid = clientProfile.PaymentLogs.Where(p => p.TripId == app.TripId).Sum(p => p.Amount),
                    HotelPayments = clientProfile.HotelPaymentLogs.Where(p => p.TripId == app.TripId).Select(p => new { p.Amount, p.PaymentDate }),
                    TotalHotelPaid = clientProfile.HotelPaymentLogs.Where(p => p.TripId == app.TripId).Sum(p => p.Amount)
                }).ToList()
            };

            return Ok(response);
        }

        [HttpGet("pending-applications")]
        public async Task<IActionResult> GetPendingApplications([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var query = _context.PendingApplications
                                .Where(p => p.Status == "Pending")
                                .OrderBy(p => p.CreatedAt);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var apps = await query.Skip((page - 1) * pageSize)
                                  .Take(pageSize)
                                  .ToListAsync();

            return Ok(new 
            {
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize,
                Data = apps
            });
        }

        [HttpDelete("pending-applications/{id}")]
        public async Task<IActionResult> RejectApplication(int id)
        {
            var app = await _context.PendingApplications.FindAsync(id);
            if (app == null) return NotFound("Pending application not found.");

            app.Status = "Rejected";
            app.CreatedAt = DateTime.UtcNow; // Reset to track the 48-hour window from the moment of rejection
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("pending-applications/{id}")]
        public async Task<IActionResult> UpdateApplication(int id)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var app = await _context.PendingApplications.FindAsync(id);
            if (app == null) return NotFound("Pending application not found.");
            
            // Check ownership
            if (app.UserAccountId != userId)
                return Forbid("You do not have permission to modify this application.");
            
            using var reader = new System.IO.StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            
            if (string.IsNullOrWhiteSpace(body)) return BadRequest("Empty payload.");

            app.PayloadJson = body;
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true });
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPost("pending-applications/{id}/approve")]
        public async Task<IActionResult> ApproveApplication(int id)
        {
            var app = await _context.PendingApplications.FindAsync(id);
            if (app == null) return NotFound("Pending application not found.");

            if (app.Status != "Pending") return BadRequest("Application is not pending.");

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var request = JsonSerializer.Deserialize<SaveClientRequest>(app.PayloadJson, options);
            if (request == null) return BadRequest("Failed to deserialize application payload.");

            // Set the worker ID who approved it and flag it as from website
            if (int.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out int workerId))
            {
                request.CreatedByWorkerId = workerId;
            }
            request.IsFromWebsite = true;
            request.UserAccountId = app.UserAccountId;

            // Delegate to the ClientsController logic to save the client officially
            var clientsController = new ClientsController(_context);
            var result = await clientsController.SaveClient(request);

            if (result is OkResult || result is OkObjectResult)
            {
                // If SaveClient succeeds, physically delete this from the pending queue
                _context.PendingApplications.Remove(app);
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            
            // If it fails, return the error
            return result;
        }
        [HttpGet("rejected-applications")]
        public async Task<IActionResult> GetRejectedApplications()
        {
            var cutoffTime = DateTime.UtcNow.AddHours(-48);
            
            // Auto-delete expired rejected apps
            var expiredApps = await _context.PendingApplications
                .Where(p => p.Status == "Rejected" && p.CreatedAt < cutoffTime)
                .ToListAsync();
                
            if (expiredApps.Any())
            {
                _context.PendingApplications.RemoveRange(expiredApps);
                await _context.SaveChangesAsync();
            }

            var apps = await _context.PendingApplications
                                     .Where(p => p.Status == "Rejected" && p.CreatedAt >= cutoffTime)
                                     .OrderByDescending(p => p.CreatedAt)
                                     .ToListAsync();
            return Ok(apps);
        }

        [HttpPost("pending-applications/{id}/restore")]
        public async Task<IActionResult> RestoreApplication(int id)
        {
            var app = await _context.PendingApplications.FindAsync(id);
            if (app == null) return NotFound("Pending application not found.");

            if (app.Status != "Rejected") return BadRequest("Only rejected applications can be restored.");

            app.Status = "Pending";
            app.CreatedAt = DateTime.UtcNow; // Reset to now so it appears at the top of pending
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true });
        }
    }
}
