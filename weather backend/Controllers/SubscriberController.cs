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


  }
}
