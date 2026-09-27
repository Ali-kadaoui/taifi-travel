using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace taifi_travel_back.Models
{
    public class ContactMessage
    {
        [Key]
        public int Id { get; set; }

        public int? UserAccountId { get; set; }
        
        [ForeignKey("UserAccountId")]
        public virtual UserAccount? UserAccount { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [Required]
        public string MessageContent { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
