using weather_backend.Data;
using weather_backend.Models;
using weather_backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace weather_backend.Repositories
{
  public class SubscriberRepository : ISubscriberRepository
  {
    private readonly AppDbContext _context;
    public SubscriberRepository(AppDbContext context)
    {
      _context = context;
    }
    public async Task<IEnumerable<Subscriber>> GetAllAsync()
    {
      return await _context.Subscribers.ToListAsync();
    }

    public async Task AddAsync(Subscriber subscriber)
    {
      await _context.Subscribers.AddAsync(subscriber);
      await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Subscriber subscriber)
    {
      _context.Subscribers.Update(subscriber);
      await _context.SaveChangesAsync();
    }
    public async Task<Subscriber?> GetByIdAsync(int id)
    {
      return await _context.Subscribers.FindAsync(id);
    }
  }
}
