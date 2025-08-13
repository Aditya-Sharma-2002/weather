using System.Net;
using System.Net.Mail;
using System.Net.Mime;
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
                            bool sent = await SendEmail(sub.email, sub.first, sub.last, sub.city);
                            if (sent)
                            {
                                Console.WriteLine("Email sent");
                                sub.createdAt = DateTime.UtcNow;
                                await repo.UpdateAsync(sub);
                            }
                        }
                    }
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task<bool> SendEmail(string toEmail, string firstName, string lastName, string city)
        {
            try
            {
                var fromEmail = Environment.GetEnvironmentVariable("EMAIL");
                var password = Environment.GetEnvironmentVariable("PASSWORD");
                using var httpClient = new HttpClient();

                // Get coordinates
                var geoUrl = $"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid="+Environment.GetEnvironmentVariable("OPEN_WEATHER_MAP_API_KEY");
                var geoResponse = await httpClient.GetAsync(geoUrl);
                if (!geoResponse.IsSuccessStatusCode) return false;

                var geoJson = await geoResponse.Content.ReadAsStringAsync();
                using var geoDoc = JsonDocument.Parse(geoJson);
                var geoRoot = geoDoc.RootElement;
                if (geoRoot.GetArrayLength() == 0) return false;

                double lat = geoRoot[0].GetProperty("lat").GetDouble();
                double lon = geoRoot[0].GetProperty("lon").GetDouble();

                // Get weather
                var weatherUrl = $"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid="+Environment.GetEnvironmentVariable("OPEN_WEATHER_MAP_API_KEY") +"&units=metric";
                var weatherResponse = await httpClient.GetAsync(weatherUrl);
                if (!weatherResponse.IsSuccessStatusCode) return false;

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
                    Credentials = new NetworkCredential(fromEmail, password), // Gmail credentials
                    EnableSsl = true,
                };

                var message = new MailMessage(fromEmail, toEmail)
                {
                    Subject = "Your Weather Update"
                };

                // Plain-text fallback
                var text = $@"Hello {firstName} {lastName},

                Weather in {city}:
                - {description}
                - Temp: {temp}°C
                - Humidity: {humidity}%

                Stay comfy!
                — Weather Alerts";


                // HTML version
                var html = $@"<!DOCTYPE html>
                <html lang=""en"">
                <head>
                  <meta charset=""utf-8"">
                  <meta name=""viewport"" content=""width=device-width, initial-scale=1"">
                  <title>Weather Update</title>
                  <style>
                    /* Base resets */
                    body, table, td, a {{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}
                    table, td {{ mso-table-lspace:0pt; mso-table-rspace:0pt; }}
                    img {{ -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }}
                    body {{ margin:0; padding:0; width:100%!important; height:100%!important; background:#0b1220; }}
                    /* Container */
                    .wrapper {{ width:100%; background:#0b1220; padding:24px 12px; }}
                    .container {{ max-width:600px; margin:0 auto; background:#0f172a; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,.25); }}
                    .header {{ padding:24px 24px 0; color:#cbd5e1; font-family:Segoe UI, Roboto, Helvetica, Arial, sans-serif; }}
                    .brand {{ font-size:18px; letter-spacing:.4px; text-transform:uppercase; opacity:.85; }}
                    .title {{ margin:8px 0 0; font-size:28px; line-height:1.2; color:#e2e8f0; }}
                    .preheader {{ display:none; font-size:1px; color:#0b1220; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }}
                    /* Card */
                    .card {{ margin:24px; border-radius:14px; background:linear-gradient(135deg, #1f2937 0%, #0b1220 100%); border:1px solid #263143; }}
                    .hero {{ padding:24px; color:#e5e7eb; }}
                    .city {{ font-size:22px; margin:0 0 6px; }}
                    .desc {{ margin:0; font-size:16px; opacity:.9; }}
                    .metrics {{ padding:16px 24px 24px; }}
                    .row {{ display:flex; gap:12px; flex-wrap:wrap; }}
                    .pill {{ flex:1 1 160px; background:#111827; border:1px solid #263143; border-radius:12px; padding:14px 16px; }}
                    .pill h4 {{ margin:0 0 6px; font-size:12px; font-weight:600; letter-spacing:.6px; color:#93c5fd; text-transform:uppercase; }}
                    .pill p {{ margin:0; font-size:20px; font-weight:700; color:#f8fafc; }}
                    /* Button */
                    .cta-wrap {{ padding:0 24px 24px; }}
                    .btn {{ display:inline-block; padding:14px 18px; border-radius:12px; text-decoration:none; font-weight:600; background:#3b82f6; color:#fff; }}
                    /* Footer */
                    .footer {{ padding:16px 24px 24px; color:#94a3b8; font-size:12px; line-height:1.5; }}
                    .muted {{ color:#64748b; }}
                    /* Mobile */
                    @media only screen and (max-width:600px) {{
                      .title {{ font-size:24px; }}
                      .hero {{ padding:20px; }}
                      .metrics {{ padding:12px 20px 20px; }}
                      .row {{ gap:10px; }}
                      .pill {{ flex:1 1 100%; }}
                      .cta-wrap {{ padding:0 20px 20px; }}
                    }}
                    /* Dark mode hint (some clients respect it) */
                    @media (prefers-color-scheme: light) {{
                      body {{ background:#f1f5f9; }}
                      .wrapper {{ background:#f1f5f9; }}
                      .container {{ background:#ffffff; }}
                      .card {{ background:linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-color:#e5e7eb; }}
                      .pill {{ background:#f8fafc; border-color:#e5e7eb; }}
                      .title, .desc, .pill p {{ color:#0f172a; }}
                      .brand {{ color:#334155; }}
                      .footer {{ color:#475569; }}
                      .muted {{ color:#64748b; }}
                    }}
                  </style>
                </head>
                <body>
                  <!-- Preheader (preview text) -->
                  <div class=""preheader"">Today in {city}: {description}. Temp {temp}°C, humidity {humidity}%.</div>

                  <div class=""wrapper"">
                    <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"">
                      <tr>
                        <td align=""center"">
                          <table role=""presentation"" class=""container"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"">
                            <tr>
                              <td class=""header"">
                                <div class=""brand"">Weather Alerts</div>
                                <h1 class=""title"">Your Weather Update</h1>
                              </td>
                            </tr>

                            <tr>
                              <td>
                                <table role=""presentation"" class=""card"" width=""100%"" cellspacing=""0"" cellpadding=""0"" border=""0"">
                                  <tr>
                                    <td class=""hero"">
                                      <h2 class=""city"">Hi {firstName} {lastName}, here’s {city}’s forecast</h2>
                                      <p class=""desc"">• {description}</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td class=""metrics"">
                                      <div class=""row"">
                                        <div class=""pill"">
                                          <h4>Temperature</h4>
                                          <p>{temp}°C</p>
                                        </div>
                                        <div class=""pill"">
                                          <h4>Humidity</h4>
                                          <p>{humidity}%</p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td class=""cta-wrap"">
                                      <a class=""btn"" href=""#"" target=""_blank"" rel=""noopener"">View Full Forecast</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <tr>
                              <td class=""footer"">
                                You’re receiving this because you subscribed to weather updates for {city}.<br>
                                <span class=""muted"">Tip:</span> Add us to your contacts so these emails don’t get lost.
                                <br><br>
                                <a href=""#"" style=""color:inherit; text-decoration:underline;"">Manage preferences</a> •
                                <a href=""#"" style=""color:inherit; text-decoration:underline;"">Unsubscribe</a>
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </body>
                </html>";

                // Add alternate views
                var avText = AlternateView.CreateAlternateViewFromString(text, null, MediaTypeNames.Text.Plain);
                var avHtml = AlternateView.CreateAlternateViewFromString(html, null, MediaTypeNames.Text.Html);

                message.AlternateViews.Add(avText);
                message.AlternateViews.Add(avHtml);
                message.IsBodyHtml = true;

                await smtpClient.SendMailAsync(message);
                return true; // ✅ Success
            }
            catch (Exception ex)
            {
                // You can log the exception here
                return false; // ❌ Something went wrong
            }
        }
    }
    }
