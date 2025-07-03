using System.Net;
using System.Net.Mail;
using System.Text.Json;
using weather_backend.Interfaces;

namespace weather_backend.Services
{
  public class EmailSchedulerService : BackgroundService
  {
    private readonly IServiceProvider _serviceProvider;

    public EmailSchedulerService(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      while (!stoppingToken.IsCancellationRequested)
      {
        using (var scope = _serviceProvider.CreateScope())
        {
          var repo = scope.ServiceProvider.GetRequiredService<ISubscriberRepository>();
          var subscribers = await repo.GetAllAsync();

          foreach (var sub in subscribers)
          {
            if ((DateTime.UtcNow - sub.createdAt).TotalMilliseconds >= sub.time)
            {
              SendEmail(sub.email, sub.first, sub.city);
              sub.createdAt = DateTime.UtcNow;
              await repo.UpdateAsync(sub);
            }
          }
        }

        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
      }
    }

    private async Task SendEmail(string toEmail, string firstName, string city)
    {
      var fromEmail = Environment.GetEnvironmentVariable("EMAIL_USERNAME");
      var password = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");

      using var httpClient = new HttpClient();

      // Get latitude and longitude
      var geoUrl = $"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid=dda175c03f9d60359987d65376ea067f";
      var geoResponse = await httpClient.GetAsync(geoUrl);
      var geoJson = await geoResponse.Content.ReadAsStringAsync();

      using var geoDoc = JsonDocument.Parse(geoJson);
      var geoRoot = geoDoc.RootElement;
      if (geoRoot.GetArrayLength() == 0) return;

      double lat = geoRoot[0].GetProperty("lat").GetDouble();
      double lon = geoRoot[0].GetProperty("lon").GetDouble();

      // Get weather data
      var weatherUrl = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=dda175c03f9d60359987d65376ea067f&units=metric";
      var weatherResponse = await httpClient.GetAsync(weatherUrl);
      var weatherJson = await weatherResponse.Content.ReadAsStringAsync();

      using var weatherDoc = JsonDocument.Parse(weatherJson);
      var root = weatherDoc.RootElement;

      string description = root.GetProperty("weather")[0].GetProperty("description").GetString()!;
      double temp = root.GetProperty("main").GetProperty("temp").GetDouble();
      int humidity = root.GetProperty("main").GetProperty("humidity").GetInt32();

      // Send email
      var smtpClient = new SmtpClient("smtp.gmail.com")
      {
        Port = 587,
        Credentials = new NetworkCredential(fromEmail, password),
        EnableSsl = true,
      };

      var message = new MailMessage(fromEmail, toEmail)
      {
        Subject = "Your Weather Update",
        Body = $"Hello {firstName},\n\nWeather in {city}:\n- {description}\n- Temp: {temp}°C\n- Humidity: {humidity}%"
      };

      await smtpClient.SendMailAsync(message);
    }
  }
  }
