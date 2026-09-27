using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using taifi_travel_back.Data;
using taifi_travel_back.Models;

namespace taifi_travel_back.Controllers
{
    [ApiController]
    [Route("api")]
    public class HotelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HotelsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("hotels")]
        public async Task<IActionResult> GetHotels()
        {
            var hotels = await _context.Hotels
                .Select(h => new
                {
                    h.Id,
                    h.Name,
                    h.City,
                    h.ImagesBase64,
                    Offers = h.HotelOffers.Select(o => new {
                        o.Id,
                        o.Capacity,
                        o.Price
                    })
                })
                .ToListAsync();

            return Ok(hotels);
        }

        [HttpGet("hotels/{id}")]
        public async Task<IActionResult> GetHotelById(int id)
        {
            var hotel = await _context.Hotels
                .Include(h => h.HotelOffers)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hotel == null) return NotFound("Hotel not found.");

            return Ok(new
            {
                hotel.Id,
                hotel.Name,
                hotel.City,
                hotel.ImagesBase64,
                Offers = hotel.HotelOffers.Select(o => new {
                    o.Id,
                    o.Capacity,
                    o.Price
                })
            });
        }

        [HttpPost("create-hotel")]
        public async Task<IActionResult> CreateHotel([FromBody] HotelRequest request)
        {
            var hotel = new Hotel
            {
                Name = request.Name,
                City = request.City
            };

            if (request.ImagesBase64 != null)
            {
                hotel.ImagesBase64 = request.ImagesBase64.Take(5).ToList();
            }

            _context.Hotels.Add(hotel);
            await _context.SaveChangesAsync();

            if (request.Offers != null && request.Offers.Any())
            {
                foreach (var offer in request.Offers)
                {
                    _context.HotelOffers.Add(new HotelOffer
                    {
                        HotelId = hotel.Id,
                        Capacity = offer.Capacity,
                        Price = offer.Price
                    });
                }
                await _context.SaveChangesAsync();
            }
            return Ok(new 
            {
                id = hotel.Id,
                name = hotel.Name,
                city = hotel.City,
                offersCount = request.Offers != null ? request.Offers.Count : 0
            });
        }

        [HttpPost("update-hotel/{id}")]
        public async Task<IActionResult> UpdateHotel(int id, [FromBody] HotelRequest request)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null) return NotFound();

            if (request.Name != null) hotel.Name = request.Name;
            if (request.City != null) hotel.City = request.City;

            if (request.ImagesBase64 != null)
            {
                hotel.ImagesBase64 = request.ImagesBase64.Take(5).ToList();
            }

            if (request.Offers != null && request.Offers.Any())
            {
                foreach (var offer in request.Offers)
                {
                    _context.HotelOffers.Add(new HotelOffer
                    {
                        HotelId = hotel.Id,
                        Capacity = offer.Capacity,
                        Price = offer.Price
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpDelete("delete-hotel/{id}")]
        public async Task<IActionResult> DeleteHotel(int id)
        {
            var hotel = await _context.Hotels.FindAsync(id);
            if (hotel == null) return NotFound();

            _context.Hotels.Remove(hotel);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("delete-hotel-offer/{id}")]
        public async Task<IActionResult> DeleteHotelOffer(int id)
        {
            var offer = await _context.HotelOffers.FindAsync(id);
            if (offer == null) return NotFound("Offer not found.");

            _context.HotelOffers.Remove(offer);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("update-hotel-offer/{id}")]
        public async Task<IActionResult> UpdateHotelOffer(int id, [FromBody] HotelOfferDto request)
        {
            var offer = await _context.HotelOffers.FindAsync(id);
            if (offer == null) return NotFound("Offer not found.");

            offer.Capacity = request.Capacity;
            offer.Price = request.Price;

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }

    public class HotelRequest
    {
        public string? Name { get; set; }
        public string? City { get; set; }
        public List<HotelOfferDto> Offers { get; set; } = new List<HotelOfferDto>();
        public List<string>? ImagesBase64 { get; set; }
    }

    public class HotelOfferDto
    {
        public int Capacity { get; set; }
        public decimal Price { get; set; }
    }
}
