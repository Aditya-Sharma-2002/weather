using Microsoft.AspNetCore.Mvc;
using weather_backend.Interfaces;
using weather_backend.Models;

namespace weather_backend.Controllers
{

  [ApiController]
  [Route("api/[controller]")]
  public class SubscriberController : ControllerBase
  {
    private readonly ISubscriberRepository _subscriberRepository;

    public SubscriberController(ISubscriberRepository subscriberRepository)
    {
      _subscriberRepository = subscriberRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubscriberController>>> GetAllSubscribers()
    {
      var subscribers = await _subscriberRepository.GetAllAsync();
      return Ok(subscribers);
    }

    [HttpPost]
    public async Task<ActionResult<Subscriber>> AddSubscriber(Subscriber subscriber)
    {
      //Console.WriteLine(subscriber);
      subscriber.createdAt = DateTime.UtcNow;
      await _subscriberRepository.AddAsync(subscriber);
      return Ok(subscriber);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Subscriber>> GetSubscriber(int id)
    {
      var subscriber = await _subscriberRepository.GetByIdAsync(id);

      if (subscriber == null)
        return NotFound();

      return Ok(subscriber);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubscriber(int id, Subscriber updatedSubscriber)
    {
      if (id != updatedSubscriber.Id)
      {
        return BadRequest("Subscriber ID mismatch");
      }
      var existing = await _subscriberRepository.GetByIdAsync(id);
      if (existing == null)
      {
        return NotFound("Subscriber not found.");
      }

      existing.createdAt = updatedSubscriber.createdAt;

      await _subscriberRepository.UpdateAsync(existing);
      return NoContent();
    }

    [HttpGet("reverse-geocode")]
    public async Task<IActionResult> ReverseGeocode(double lat, double lon)
    {
        using var client = new HttpClient();
        var url = $"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json";
        client.DefaultRequestHeaders.UserAgent.ParseAdd("YourApp/1.0");

        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode) return StatusCode((int)response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        return Content(content, "application/json");
    }


    }
}
