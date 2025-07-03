import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-aqi',
  standalone: true,
  imports: [],
  templateUrl: './aqi.component.html',
  styleUrls: ['./aqi.component.css']
})
export class AqiComponent implements OnInit {

  key = 'dda175c03f9d60359987d65376ea067f';
  latitude!: number;
  longitude!: number;
  date = new Date();
  map: any;
  pollutants: any[] = [];
  markers: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    console.log(`object`);
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
    console.log("Long: " , this.latitude, "Lat : ", this.longitude);
    this.map = L.map('map1').setView([this.latitude, this.longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (event: any) => {
      const lat = event.latlng.lat;
      const lng = event.latlng.lng;
      // console.log(lat, " :: " , lng);
      this.fetchAQIData(lat, lng);
      this.fetchPollutants(lat, lng);
    });
  }

  fetchAQIData(lat: number, lon: number) {
    fetch(`https://geocode.xyz/${lat},${lon}?geoit=json`)
      .then(res => res.json())
      .then(loc => {
        console.log(loc);
        fetch(`https://api.waqi.info/search/?token=d9d6fd38c2f43fc932d2c011f45d9b605748e0c6&keyword=${loc.city}`)
          .then(res => res.json())
          .then(data => {
            // console.log(data.data);
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

                L.marker([item.station.geo[0], item.station.geo[1]])
                  .addTo(this.map)
                  .bindPopup(L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${aqiClass}-strip`
                  })
                    .setContent(`AQI: ${aqi}, ${message}<br>Place: ${item.station.name}`))
                  .openPopup();
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
}
