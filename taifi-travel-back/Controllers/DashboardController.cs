using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taifi_travel_back.Data;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            // ── Active trip IDs ────────────────────────────────────────────────────────
            // All subsequent aggregations are scoped to active (non-completed/archived) trips.
            var activeTripIds = await _context.Trips
                .AsNoTracking()
                .Where(t => !t.IsArchived)

                .Select(t => t.Id)
                .ToListAsync();

            // ── 1. FINANCIALS ──────────────────────────────────────────────────────────

            // Total Revenue Expected: SUM(trip.Price * activeApplicationCount) per active trip — pure DB aggregation.
            // We join Trips with their Application counts, multiply, then sum at DB level.
            var totalRevenueExpected = await _context.Applications
                .AsNoTracking()
                .Where(a => a.TripId.HasValue && activeTripIds.Contains(a.TripId.Value))
                .Where(a => !_context.ClientProfiles.Any(c => c.Id == a.ClientId && c.IsArchived))
                .SumAsync(a => a.Trip!.Price + (a.HotelOfferId.HasValue ? a.HotelOffer!.Price : 0m));

            // Total Cash Collected: sum of all PaymentLogs belonging to active trips only.
            var totalCashCollected = await _context.PaymentLogs
                .AsNoTracking()
                .Where(p => p.TripId.HasValue && activeTripIds.Contains(p.TripId.Value))
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            // Also count hotel payment logs for active trips
            var totalHotelCashCollected = await _context.HotelPaymentLogs
                .AsNoTracking()
                .Where(p => p.TripId.HasValue && activeTripIds.Contains(p.TripId.Value))
                .SumAsync(p => (decimal?)p.Amount) ?? 0m;

            totalCashCollected += totalHotelCashCollected;

            // Outstanding Debt: strictly computed, never hardcoded
            decimal outstandingDebt = totalRevenueExpected - totalCashCollected;

            // Active Pilgrims: count of all non-archived clients
            int activePilgrims = await _context.ClientProfiles
                .AsNoTracking()
                .CountAsync(c => !c.IsArchived);

            // ── 2. CAMPAIGN READINESS MATRIX ──────────────────────────────────────────
            // Fetches each active trip with its aggregate stats: 
            // travelers, expected revenue, collected revenue (trip + hotel), visa readiness.
            // No full PaymentLog or Application lists are loaded into memory.

            var activeTrips = await _context.Trips
                .AsNoTracking()
                .Where(t => activeTripIds.Contains(t.Id))
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.TripType,
                    t.DepartureDate,
                    t.Price,

                    // Count active (non-archived) applications for this trip
                    TravelersEnrolled = t.Applications
                        .Count(a => !_context.ClientProfiles
                            .Where(c => c.Id == a.ClientId && c.IsArchived)
                            .Any()),

                    // Documents fully deposited count
                    DocsCompleteCount = t.Applications
                        .Count(a => a.PassportDeposited && a.PhotoDeposited && a.CertificateDeposited),

                    // Trip payment sum for this trip only
                    TripCashCollected = (decimal)(_context.PaymentLogs
                        .Where(p => p.TripId == t.Id)
                        .Sum(p => (decimal?)p.Amount) ?? 0m),

                    // Hotel payment sum for this trip only  
                    HotelCashCollected = (decimal)(_context.HotelPaymentLogs
                        .Where(p => p.TripId == t.Id)
                        .Sum(p => (decimal?)p.Amount) ?? 0m),
                })
                .OrderBy(t => t.DepartureDate)
                .ToListAsync();

            var campaignMatrix = activeTrips.Select(t =>
            {
                var revenueCollected = t.TripCashCollected; // Only trip price, ignore hotel
                var totalExpectedRevenue = t.Price * t.TravelersEnrolled;

                // Safe division — clamp to [0, 100]
                var revPct = totalExpectedRevenue > 0
                    ? (int)Math.Min(100, Math.Round((revenueCollected / totalExpectedRevenue) * 100))
                    : 0;

                var visaPct = t.TravelersEnrolled > 0
                    ? (int)Math.Min(100, Math.Round(((double)t.DocsCompleteCount / t.TravelersEnrolled) * 100))
                    : 0;

                return new
                {
                    campaign = t.Title,
                    type = t.TripType,
                    departureDate = t.DepartureDate?.ToString("yyyy-MM-dd"),
                    travelers = t.TravelersEnrolled,
                    capacity = 50,
                    docsReadyCount = t.DocsCompleteCount,
                    revenueCollected,
                    totalExpectedRevenue,
                    revPct,
                    visaPct
                };
            }).ToList();

            // ── 3. COMPLIANCE WATCHLIST ────────────────────────────────────────────────

            // Incomplete Visa Files: active applications with any document missing
            var incompleteVisas = await _context.Applications
                .AsNoTracking()
                .Where(a => a.TripId.HasValue && activeTripIds.Contains(a.TripId.Value))
                .CountAsync(a => !a.PassportDeposited || !a.PhotoDeposited || !a.CertificateDeposited);

            // Unverified Contacts: clients with no valid contact info
            var unverifiedContacts = await _context.ClientProfiles
                .AsNoTracking()
                .Where(c => !c.IsArchived)
                .CountAsync(c => c.Account == null
                    || !c.Account.ContactValid
                    || (string.IsNullOrEmpty(c.Account.Email) && string.IsNullOrEmpty(c.Account.PhoneNumber)));

            // Pending Hajj Tests: scoped to active trips only
            var pendingTests = await _context.HajjDetails
                .AsNoTracking()
                .Where(h => _context.Applications
                    .Any(a => a.Id == h.ApplicationId
                        && a.TripId.HasValue
                        && activeTripIds.Contains(a.TripId.Value)))
                .CountAsync(h => h.TestStatus == "Pending");

            // Incomplete Payments: active-trip applications where total payment is less than trip price
            var incompletePayments = await _context.Applications
                .AsNoTracking()
                .Where(a => a.TripId.HasValue && activeTripIds.Contains(a.TripId.Value))
                .Where(a => (_context.PaymentLogs
                    .Where(p => p.ClientId == a.ClientId && p.TripId == a.TripId)
                    .Sum(p => (decimal?)p.Amount) ?? 0m) < _context.Trips.Where(t => t.Id == a.TripId).Select(t => t.Price).FirstOrDefault())
                .CountAsync();

            // Incomplete Trip Data: active trips missing departure or return dates
            var incompleteTripData = await _context.Trips
                .AsNoTracking()
                .Where(t => activeTripIds.Contains(t.Id))
                .CountAsync(t => t.DepartureDate == null || t.ReturnDate == null);

            // Incomplete Hotel Payment: active-trip applications that selected a hotel but paid less than the offer price
            var incompleteHotelPayment = await _context.Applications
                .AsNoTracking()
                .Where(a => a.TripId.HasValue && activeTripIds.Contains(a.TripId.Value) && a.HotelOfferId.HasValue)
                .Where(a => (_context.HotelPaymentLogs
                    .Where(p => p.ClientId == a.ClientId && p.TripId == a.TripId)
                    .Sum(p => (decimal?)p.Amount) ?? 0m) < a.HotelOffer!.Price)
                .CountAsync();

            return Ok(new
            {
                financials = new
                {
                    totalRevenueExpected,
                    totalCashCollected,
                    outstandingDebt,
                    activePilgrims
                },
                readinessData = campaignMatrix,
                compliance = new
                {
                    incompleteVisas,
                    unverifiedContacts,
                    pendingTests,
                    incompletePayments,
                    incompleteTripData,
                    incompleteHotelPayment
                }
            });
        }
    }
}
