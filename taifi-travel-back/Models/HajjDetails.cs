namespace taifi_travel_back.Models
{
    public class HajjDetails
    {
        public int ApplicationId { get; set; }
        public Application? Application { get; set; }

        public string? WorkerRole { get; set; }
        public int? CalculatedAge { get; set; }
        public string? TestStatus { get; set; }
    }
}
