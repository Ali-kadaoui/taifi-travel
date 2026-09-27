using System;
using System.Collections.Generic;

namespace taifi_travel_back.Models
{
    public class ClientProfile
    {
        public int Id { get; set; }
        
        public int? AccountId { get; set; }
        public UserAccount? Account { get; set; }

        public int? CreatedByWorkerId { get; set; }
        public WorkerAccount? CreatedByWorker { get; set; }

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Sex { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.Column(TypeName = "date")]
        public DateTime? DateOfBirth { get; set; }
        
        public string? CinNumber { get; set; }
        public string? Notes { get; set; }
        
        public bool IsArchived { get; set; }
        
        public bool IsFromWebsite { get; set; }
        
        public ICollection<Application> Applications { get; set; } = new List<Application>();
        public ICollection<PaymentLog> PaymentLogs { get; set; } = new List<PaymentLog>();
        public ICollection<HotelPaymentLog> HotelPaymentLogs { get; set; } = new List<HotelPaymentLog>();
    }
}
