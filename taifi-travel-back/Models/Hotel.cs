using System.Collections.Generic;

namespace taifi_travel_back.Models
{
    public class Hotel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? City { get; set; }

        public ICollection<HotelOffer> HotelOffers { get; set; } = new List<HotelOffer>();
        
        public List<string>? ImagesBase64 { get; set; }
    }
}
