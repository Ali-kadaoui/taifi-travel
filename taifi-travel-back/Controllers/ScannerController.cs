using Microsoft.AspNetCore.Mvc;
using taifi_travel_back.Services;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api")]
    public class ScannerController : ControllerBase
    {
        private readonly ScannerSyncService _syncService;

        public ScannerController(ScannerSyncService syncService)
        {
            _syncService = syncService;
        }

        [HttpPost("sync-data")]
        public IActionResult SyncData([FromBody] SyncDataRequest request)
        {
            if (request.WorkerId <= 0)
                return BadRequest("Invalid worker_id");

            var scanData = new ScanData
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                CinNumber = request.CinNumber,
                DateOfBirth = request.DateOfBirth,
                Sex = request.Sex,
                Timestamp = DateTime.UtcNow
            };

            _syncService.AddOrUpdateScan(request.WorkerId, scanData);

            return Ok(new { message = "Data synced successfully." });
        }

        [HttpGet("get-latest")]
        public IActionResult GetLatest([FromQuery] int worker_id)
        {
            // Non-destructive read - dashboard can poll multiple times and still get data
            if (_syncService.TryGetScan(worker_id, out var scanData))
            {
                return Ok(scanData);
            }

            return NotFound(new { message = "No recent scans found for this worker." });
        }

        [HttpDelete("acknowledge-scan")]
        public IActionResult AcknowledgeScan([FromQuery] int worker_id)
        {
            _syncService.TryGetAndRemoveScan(worker_id, out _);
            return Ok(new { message = "Scan acknowledged and cleared." });
        }
    }

    public class SyncDataRequest
    {
        public int WorkerId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? CinNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Sex { get; set; }
    }

    public class ScanData
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? CinNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Sex { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
