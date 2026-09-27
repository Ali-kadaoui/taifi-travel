using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using taifi_travel_back.Data;
using taifi_travel_back.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var worker = await _context.WorkerAccounts.FirstOrDefaultAsync(w => w.Username == request.Username);
            
            if (worker == null || string.IsNullOrEmpty(worker.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, worker.PasswordHash))
                return Unauthorized("Invalid credentials.");

            if (worker.IsDisabled)
                return Forbid("Account is disabled.");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, worker.Id.ToString()),
                new Claim(ClaimTypes.Name, worker.Username),
                new Claim(ClaimTypes.Role, worker.Role)
            };

            var jwtKey = _configuration["JwtSettings:SecretKey"] ?? "default_secret_key";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"] ?? "taifi-travel",
                audience: _configuration["JwtSettings:Audience"] ?? "taifi-travel-users",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            var parsedPermissions = worker.PermissionsJson != null 
                ? JsonSerializer.Deserialize<object>(worker.PermissionsJson) 
                : new { };

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Worker = new
                {
                    worker.Id,
                    worker.Username,
                    worker.FullName,
                    worker.Role,
                    Permissions = parsedPermissions
                }
            });
        }

        [HttpGet("workers")]
        public async Task<IActionResult> GetWorkers()
        {
            var workers = await _context.WorkerAccounts
                .Select(w => new { w.Id, w.Username, w.FullName, w.Role, w.IsDisabled, w.PermissionsJson })
                .ToListAsync();
            return Ok(workers);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var id))
                return Unauthorized();

            var worker = await _context.WorkerAccounts.FindAsync(id);
            if (worker == null || worker.IsDisabled) return Unauthorized();

            var parsedPermissions = worker.PermissionsJson != null 
                ? JsonSerializer.Deserialize<object>(worker.PermissionsJson) 
                : new { };

            return Ok(new
            {
                worker.Id,
                worker.Username,
                worker.FullName,
                worker.Role,
                Permissions = parsedPermissions
            });
        }

        [HttpPost("create-worker")]
        public async Task<IActionResult> CreateWorker([FromBody] WorkerRequest request)
        {
            if (await _context.WorkerAccounts.AnyAsync(w => w.Username == request.Username))
                return BadRequest("Username already exists.");

            var worker = new WorkerAccount
            {
                Username = request.Username,
                FullName = request.FullName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role ?? "Agent",
                PermissionsJson = string.IsNullOrEmpty(request.PermissionsJson) ? "{}" : request.PermissionsJson
            };

            _context.WorkerAccounts.Add(worker);
            await _context.SaveChangesAsync();
            return Ok(new { worker.Id, worker.Username });
        }

        [HttpPost("update-worker/{id}")]
        public async Task<IActionResult> UpdateWorker(int id, [FromBody] WorkerUpdateRequest request)
        {
            var worker = await _context.WorkerAccounts.FindAsync(id);
            if (worker == null) return NotFound();

            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (currentUserRole == "Agent" && worker.Role == "Admin")
                return StatusCode(403, "Agents cannot modify Admin accounts.");

            bool isSensitiveChange = false;
            if (!string.IsNullOrEmpty(request.Username) && request.Username != worker.Username) isSensitiveChange = true;
            if (request.FullName != null && request.FullName != worker.FullName) isSensitiveChange = true;
            if (!string.IsNullOrEmpty(request.Password)) isSensitiveChange = true;

            if (isSensitiveChange)
            {
                if (string.IsNullOrEmpty(request.AdminPassword))
                    return Unauthorized("Password required for sensitive changes.");
                
                var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(currentUserIdStr, out int currentUserId))
                {
                    var currentUser = await _context.WorkerAccounts.FindAsync(currentUserId);
                    if (currentUser == null || string.IsNullOrEmpty(currentUser.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.AdminPassword, currentUser.PasswordHash))
                        return Unauthorized("Invalid password. Action blocked.");
                }
                else
                {
                    return Unauthorized("Could not identify current user.");
                }
            }

            if (!string.IsNullOrEmpty(request.Username)) worker.Username = request.Username;
            if (request.FullName != null) worker.FullName = request.FullName;
            if (request.Role != null) worker.Role = request.Role;
            if (request.PermissionsJson != null) worker.PermissionsJson = request.PermissionsJson;
            if (request.IsDisabled.HasValue)
            {
                if (worker.Username == "admin" && request.IsDisabled.Value)
                    return BadRequest("Cannot disable the root admin account.");
                worker.IsDisabled = request.IsDisabled.Value;
            }
            if (!string.IsNullOrEmpty(request.Password))
                worker.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("verify-password")]
        public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordRequest request)
        {
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(currentUserIdStr, out int currentUserId))
            {
                var currentUser = await _context.WorkerAccounts.FindAsync(currentUserId);
                if (currentUser == null || string.IsNullOrEmpty(currentUser.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, currentUser.PasswordHash))
                    return Unauthorized(new { message = "Invalid password." });
                
                return Ok(new { success = true });
            }
            return Unauthorized(new { message = "Could not identify current user." });
        }

        [HttpDelete("delete-worker/{id}")]
        public async Task<IActionResult> DeleteWorker(int id)
        {
            var worker = await _context.WorkerAccounts.FindAsync(id);
            if (worker == null) return NotFound();

            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (currentUserRole == "Agent" && worker.Role == "Admin")
                return StatusCode(403, "Agents cannot delete Admin accounts.");

            if (worker.Username == "admin")
                return BadRequest("Cannot delete the root admin account.");

            _context.WorkerAccounts.Remove(worker);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("temp-reset-admin")]
        public async Task<IActionResult> TempResetAdmin()
        {
            var admin = await _context.WorkerAccounts.FirstOrDefaultAsync(w => w.Username == "admin");
            if (admin != null)
            {
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
                await _context.SaveChangesAsync();
                return Ok(new { message = "Admin password reset to admin123" });
            }
            return NotFound();
        }
    }

    public class LoginRequest { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
    public class VerifyPasswordRequest { public string Password { get; set; } = string.Empty; }
    public class WorkerRequest { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; public string? FullName { get; set; } public string? Role { get; set; } public string? PermissionsJson { get; set; } }
    public class WorkerUpdateRequest { public string? Username { get; set; } public string? FullName { get; set; } public string? Role { get; set; } public string? PermissionsJson { get; set; } public bool? IsDisabled { get; set; } public string? Password { get; set; } public string? AdminPassword { get; set; } }
}
