import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DataService } from '../service/data.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-aqi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aqi.component.html',
  styleUrls: ['./aqi.component.css']
})
export class AqiComponent implements OnInit {

  key = environment.openWeatherAPIKey;
  latitude!: number;
  longitude!: number;
  date = new Date();
  map: any;
  pollutants: any[] = [];
  markers: any[] = [];
  city: string = '';

  constructor(private http: HttpClient, private dataService: DataService) {}

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.latitude = pos.coords.latitude;
          this.longitude = pos.coords.longitude;
          this.initMap();
          setTimeout(() => {
            this.fetchAQIData(this.latitude, this.longitude);
            this.fetchPollutants(this.latitude, this.longitude);
          }, 1000);
        },
        () => alert(`Can't do anything`)
      );
    }
  }

  initMap() {
    this.map = L.map('map1').setView([this.latitude, this.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (event: any) => {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;
      this.fetchAQIData(lat, lng);
      this.fetchPollutants(lat, lng);
    });
  }

  fetchAQIData(lat: number, lon: number) {
    this.dataService.getGeolocation(lat, lon).subscribe(loc => {
      fetch(`https://api.waqi.info/search/?token=${environment.aqiAPIKey}&keyword=${loc.address.city || loc.address.county}`)
        .then(res => res.json())
        .then(data => {
          data.data.forEach((item: any) => {
            if (item.aqi !== '-') {
              const aqi = Number(item.aqi);
              let aqiClass = '', message = '';
              if (aqi <= 50) { aqiClass = 'good'; message = 'good'; }
              else if (aqi <= 100) { aqiClass = 'moderate'; message = 'moderate'; }
              else if (aqi <= 150) { aqiClass = 'unhealthy_sg'; message = 'unhealthy for sensitive groups'; }
              else if (aqi <= 200) { aqiClass = 'unhealthy'; message = 'unhealthy'; }
              else if (aqi <= 300) { aqiClass = 'vunhealthy'; message = 'very unhealthy'; }
              else { aqiClass = 'hazardous'; message = 'hazardous'; }

              const popup = L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${aqiClass}-strip`
              }).setContent(`AQI: ${aqi}, ${message}<br>Place: ${item.station.name}`);

              const marker = L.marker([item.station.geo[0], item.station.geo[1]])
                .addTo(this.map)
                .bindPopup(popup)
                .openPopup();

              // Delay to let popup render, then transfer class to inner wrapper
              setTimeout(() => {
                const popupElements = document.querySelectorAll('.leaflet-popup');
                popupElements.forEach(popupEl => {
                  const wrapper = popupEl.querySelector('.leaflet-popup-content-wrapper');
                  const stripClass = Array.from(popupEl.classList).find(c => c.endsWith('-strip'));
                  if (wrapper && stripClass) {
                    wrapper.classList.add(stripClass);
                    popupEl.classList.remove(stripClass);
                  }
                });
              }, 100);
            }
          });
        });
    });
  }

  fetchPollutants(lat: number, lon: number) {
    this.http.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${this.key}`)
      .subscribe((res: any) => {
        this.pollutants = Object.entries(res.list[0].components).map(([key, value]) => ({
          name: key,
          value
        }));
      });
  }

  getCity() {
    if (!this.city.trim()) return;

    this.http.get<any[]>(`https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.key}`)
      .subscribe(res => {
        if (!res.length) {
          alert("City not found");
          return;
        }

        const lat = res[0].lat;
        const lon = res[0].lon;

        this.map.setView([lat, lon], 13);
        this.fetchAQIData(lat, lon);
        this.fetchPollutants(lat, lon);
        this.city = '';
      });
  }
}
