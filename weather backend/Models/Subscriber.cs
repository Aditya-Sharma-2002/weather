using System.ComponentModel.DataAnnotations;

namespace weather_backend.Models
{
  public class Subscriber
  {
    public int Id { get; set; }
    
    [Required, MaxLength(25)]
    public string first { get; set; }

    [MaxLength(25)]
    public string? last { get; set; }

    [Required, MaxLength(25), EmailAddress]
    public string email { get; set; }

    [Required]
    public long time { get; set; }

    [Required]
    public DateTime createdAt { get; set; }

    [Required, MaxLength(20)]
    public string city { get; set; }
  }
}
