using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using taifi_travel_back.Data;
using taifi_travel_back.Models;
using Microsoft.EntityFrameworkCore;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api/public")]
    public class PublicAuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public PublicAuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] PublicSignupRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) && string.IsNullOrEmpty(request.PhoneNumber))
                return BadRequest("Must provide either Email or Phone Number.");

            // Check if user already exists
            if (!string.IsNullOrEmpty(request.Email) && await _context.UserAccounts.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email is already in use.");
            
            if (!string.IsNullOrEmpty(request.PhoneNumber) && await _context.UserAccounts.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
                return BadRequest("Phone Number is already in use.");

            var newUser = new UserAccount
            {
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                ContactValid = true
            };

            _context.UserAccounts.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account created successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] PublicLoginRequest request)
        {
            // Request.Identifier could be an Email or a Phone Number
            var user = await _context.UserAccounts.FirstOrDefaultAsync(u => 
                (u.Email != null && u.Email == request.Identifier) || 
                (u.PhoneNumber != null && u.PhoneNumber == request.Identifier));
            
            if (user == null || string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials.");

            if (!user.ContactValid)
                return Forbid("Account is not validated.");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            };

            if (!string.IsNullOrEmpty(user.Email)) claims.Add(new Claim(ClaimTypes.Email, user.Email));
            if (!string.IsNullOrEmpty(user.PhoneNumber)) claims.Add(new Claim(ClaimTypes.MobilePhone, user.PhoneNumber));

            var jwtKey = _configuration["JwtSettings:SecretKey"] ?? "default_secret_key";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"] ?? "taifi-travel",
                audience: _configuration["JwtSettings:Audience"] ?? "taifi-travel-users",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                User = new
                {
                    user.Id,
                    user.Email,
                    user.PhoneNumber
                }
            });
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var user = await _context.UserAccounts.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            return Ok(new
            {
                user.Id,
                user.Email,
                user.PhoneNumber,
                user.FirstName,
                user.LastName,
                user.CinNumber,
                user.DateOfBirth,
                user.Sex
            });
        }

        [Microsoft.AspNetCore.Authorization.Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest request)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var user = await _context.UserAccounts.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            }
            
            // Allow email/phone update if not taken
            if (!string.IsNullOrEmpty(request.Email) && request.Email != user.Email)
            {
                if (await _context.UserAccounts.AnyAsync(u => u.Email == request.Email))
                    return BadRequest("Email is already in use.");
                user.Email = request.Email;
            }

            if (!string.IsNullOrEmpty(request.PhoneNumber) && request.PhoneNumber != user.PhoneNumber)
            {
                if (await _context.UserAccounts.AnyAsync(u => u.PhoneNumber == request.PhoneNumber))
                    return BadRequest("Phone number is already in use.");
                user.PhoneNumber = request.PhoneNumber;
            }

            if (!string.IsNullOrEmpty(request.FirstName)) user.FirstName = request.FirstName;
            if (!string.IsNullOrEmpty(request.LastName)) user.LastName = request.LastName;
            if (!string.IsNullOrEmpty(request.CinNumber)) user.CinNumber = request.CinNumber;
            if (request.DateOfBirth.HasValue) user.DateOfBirth = request.DateOfBirth;
            if (!string.IsNullOrEmpty(request.Sex)) user.Sex = request.Sex;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Profile updated successfully." });
        }
    }

    public class PublicSignupRequest 
    { 
        public string? Email { get; set; } 
        public string? PhoneNumber { get; set; }
        public string Password { get; set; } = string.Empty; 
    }
    
    public class PublicLoginRequest 
    { 
        public string Identifier { get; set; } = string.Empty; // Email OR Phone
        public string Password { get; set; } = string.Empty; 
    }

    public class UpdateProfileRequest
    {
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? NewPassword { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? CinNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Sex { get; set; }
    }
}
