using Microsoft.EntityFrameworkCore;
using weather_backend.Models;

namespace weather_backend.Data
{
  public class AppDbContext : DbContext
  {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {

    }

    public DbSet<Subscriber> Subscribers { get; set; }
  }
}
