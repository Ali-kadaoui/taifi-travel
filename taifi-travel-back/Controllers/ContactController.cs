using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using taifi_travel_back.Data;
using taifi_travel_back.Models;
using taifi_travel_back.Services;

namespace taifi_travel_back.Controllers
{
    [Route("api/public/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public ContactController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public class ContactSubmitRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string? PhoneNumber { get; set; }
            public string MessageContent { get; set; } = string.Empty;
        }

        [HttpPost("submit")]
        [Authorize]
        public async Task<IActionResult> SubmitContactForm([FromBody] ContactSubmitRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MessageContent))
                return BadRequest("Message cannot be empty.");

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int? userId = null;
            if (int.TryParse(userIdString, out var parsedId))
            {
                userId = parsedId;
            }

            var contactMessage = new ContactMessage
            {
                UserAccountId = userId,
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                MessageContent = request.MessageContent
            };

            _context.ContactMessages.Add(contactMessage);
            await _context.SaveChangesAsync();

            // Send Email Notification
            var subject = $"New Contact Message from {request.Name}";
            var htmlBody = $@"
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> {request.Name}</p>
                <p><strong>Email:</strong> {request.Email}</p>
                <p><strong>Phone:</strong> {request.PhoneNumber ?? "Not provided"}</p>
                <p><strong>Message:</strong></p>
                <p>{request.MessageContent}</p>
            ";

            // We send this email to the admin email defined in appsettings or to a hardcoded email for now
            // I'll send it to the admin user config in SMTP config, which is usually the SenderEmail itself.
            await _emailService.SendEmailAsync("admin@taifitravel.com", subject, htmlBody);

            return Ok(new { success = true, message = "Your message has been sent successfully." });
        }
    }
}
