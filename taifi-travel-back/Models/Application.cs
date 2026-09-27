namespace taifi_travel_back.Models
{
    public class Application
    {
        public int Id { get; set; }

        public int ClientId { get; set; }
        public ClientProfile? Client { get; set; }

        public int? TripId { get; set; }
        public Trip? Trip { get; set; }

        public int? HotelOfferId { get; set; }
        public HotelOffer? HotelOffer { get; set; }

        public int? CreatedByWorkerId { get; set; }
        public WorkerAccount? CreatedByWorker { get; set; }

        public string? ApplicationType { get; set; }
        public bool PassportDeposited { get; set; }
        public bool PhotoDeposited { get; set; }
        public bool CertificateDeposited { get; set; }
        public bool FinalValidation { get; set; }
        
        public HajjDetails? HajjDetails { get; set; }
        public OmraDetails? OmraDetails { get; set; }
    }
}
