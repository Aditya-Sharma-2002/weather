import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChartType, GoogleChartsModule } from 'angular-google-charts';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [CommonModule, HttpClientModule, GoogleChartsModule, FormsModule], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  key = 'dda175c03f9d60359987d65376ea067f';
  date = new Date();
  latitude!: number;
  longitude!: number;
  newsItems: any[] = [];
  city : string = '';
  chart = {
    type: ChartType.LineChart,
    data: [],
    columns: ['Day', 'Min', 'Max'],
    options: {
      title: '5 Day Forecast',
      legend: { position: 'bottom' as const }
    }  
  };
  map: any;
  graphData: any = { least: [], most: [], dates: [] };
  months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  isMobile = false;
  activeTab: 'map' | 'cards' = 'map';

  constructor(private http: HttpClient, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.Handset, '(max-width: 959px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  switchTab(tab: 'map' | 'cards') {
    this.activeTab = tab;
    if(tab === 'map')
      setTimeout(() => {
        const mapInstance = L.map('map1');
        if(mapInstance){
          mapInstance.invalidateSize();        
          mapInstance.setView([this.latitude, this.longitude]);
        }
      }, 100);
  }

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;
        console.log(`lat = ${this.latitude} and lon = ${this.longitude}`);
        this.initMap();
        this.loadWeather(this.latitude, this.longitude);
        this.http.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${this.latitude}&lon=${this.longitude}&appid=${this.key}`)
        .subscribe((res: any) => {
          const today = new Date().getDate();
          this.newsItems = res.list.filter((item: any) => {
            return Number(item.dt_txt.slice(8, 10)) === today;
          });
        });

      }, err => alert("Can't get location"));
    }
  }

  initMap() {
  this.map = L.map('map1', {
    center: [this.latitude, this.longitude],
    zoom: 13,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(this.map);

  // Invalidate size after short delay to fix grey/half map
  setTimeout(() => {
    this.map.invalidateSize();
  }, 200);

  this.map.on('click', (e: any) => {
    this.latitude = e.latlng.lat;
    this.longitude = e.latlng.lng;
    this.loadWeather(this.latitude, this.longitude);
  });
}

  loadWeather(lat: number, lon: number) {
    const temp: any = { min: 0, max: 0, description: '', name: '' };

    this.http.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.key}`)
      .subscribe((res: any) => {
        const feels = res.main.feels_like - 273;
        const minTemp = res.main.temp_min - 273;
        temp.max = (feels >= minTemp) ? feels.toFixed(1) : minTemp.toFixed(1);
        temp.min = (feels < minTemp) ? feels.toFixed(1) : minTemp.toFixed(1);
        temp.description = res.weather[0].description;
        temp.name = res.name;

        L.marker([lat, lon])
          .addTo(this.map)
          .bindPopup(`Min: ${temp.min}°C Max: ${temp.max}°C<br>Description: ${temp.description}<br>Place: ${temp.name}`)
          .openPopup();
      });

    this.drawForecast(lat, lon);

    this.http.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.key}`)
    .subscribe((res: any) => {
      const selectedDate = new Date().getDate();
      this.newsItems = res.list.filter((item: any) => {
        return Number(item.dt_txt.slice(8, 10)) === selectedDate;
      });
    });
  }

  drawForecast(lat: number, lon: number) {
  const graph = this.graphData;
  graph.dates = [];
  graph.least = [];
  graph.most = [];

  this.http.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.key}`)
    .subscribe((res: any) => {
      const groupedData: Record<string, { min: number[], max: number[] }> = {};

      for (const item of res.list) {
        const dateObj = new Date(item.dt_txt);
        const dateStr = dateObj.toISOString().split('T')[0];

        if (!groupedData[dateStr]) {
          groupedData[dateStr] = { min: [], max: [] };
        }

        groupedData[dateStr].min.push(item.main.temp_min - 273);
        groupedData[dateStr].max.push(item.main.temp_max - 273);
      }

      const sortedDates = Object.keys(groupedData).sort().slice(0, 5);
      for (const d of sortedDates) {
        const tempDate = new Date(d);
        const label = `${tempDate.getDate()} ${this.months[tempDate.getMonth()]}`;
        graph.dates.push(label);
        graph.least.push(Math.min(...groupedData[d].min));
        graph.most.push(Math.max(...groupedData[d].max));
      }

      this.drawChart();
    });
}


  drawChart() {
    const chartRows = this.graphData.dates.map((d: string, i: number) => [
      d,
      this.graphData.least[i],
      this.graphData.most[i]
    ]);
    this.chart.data = chartRows;
  }

  getCity() {
  if (!this.city.trim()) return;

  this.http.get<any[]>(`https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.key}`)
    .subscribe((res) => {
      if (res.length === 0) {
        alert("City not found");
        return;
      }

      this.latitude = res[0].lat;
      this.longitude = res[0].lon;
      this.map.setView([this.latitude, this.longitude], 13);
      this.loadWeather(this.latitude, this.longitude);
      this.city = '';
    });
}
}