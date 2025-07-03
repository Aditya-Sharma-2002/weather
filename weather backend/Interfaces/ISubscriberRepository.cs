using weather_backend.Models;

namespace weather_backend.Interfaces
{
  public interface ISubscriberRepository
  {
    Task<IEnumerable<Subscriber>> GetAllAsync();
    Task<Subscriber>? GetByIdAsync(int id);
    Task AddAsync(Subscriber subscriber);
    Task UpdateAsync(Subscriber subscriber);
    //Task DeleteAsync(int id);
  }
}
