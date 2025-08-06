# 🌦️ Weather WebApp

[![Angular](https://img.shields.io/badge/Angular-16-red?logo=angular&logoColor=white)](https://angular.io/) 
[![ASP.NET](https://img.shields.io/badge/ASP.NET-Web%20API-blue?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/apps/aspnet) 
[![Leaflet](https://img.shields.io/badge/Leaflet-Map-green?logo=leaflet&logoColor=white)](https://leafletjs.com/) 
[![Google Charts](https://img.shields.io/badge/Google-Charts-yellow?logo=google&logoColor=black)](https://developers.google.com/chart)  
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE) 
[![OpenWeather](https://img.shields.io/badge/API-OpenWeatherMap-orange?logo=openweathermap&logoColor=white)](https://openweathermap.org/)

A responsive and feature-rich weather forecasting web application built with **Angular** (frontend) and **ASP.NET Web API** (backend).  
The app provides **real-time weather updates**, **interactive maps**, and a **5-day forecast visualization** — all while giving users the option to subscribe for **periodic weather emails**.

---

## ✨ Features

- 📍 **Real-Time Location Detection**
  - Automatically centers on your current geolocation.
- 🗺️ **Interactive Weather Map**
  - Built with [Leaflet](https://leafletjs.com/).
  - Click on any point on the map to get instant weather data.
- 🔍 **City Search**
  - Search for weather details in any city worldwide.
- 📰 **Hourly Forecast Cards**
  - Displays temperature, weather condition, and icons for the current day.
- 📊 **5-Day Forecast Chart**
  - Line chart powered by Google Charts for min/max temperatures.
- 📧 **Email Subscription System**
  - Subscribers receive daily/periodic weather updates via email.
- 📱 **Responsive Design**
  - Optimized for both mobile and desktop views.

---

## 🛠️ Tech Stack

### Frontend
- **Angular 16+**
- **Leaflet.js** for maps
- **Google Charts** for forecast visualization
- **Angular CDK** for responsive layouts
- **Bootstrap / Custom CSS** for UI styling

### Backend
- **ASP.NET Web API**
- **C# Background Service** for scheduling weather email updates
- **OpenWeatherMap API** for weather data

---

## ⚙️ Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/yourusername/weather-webapp.git
cd weather-webapp
