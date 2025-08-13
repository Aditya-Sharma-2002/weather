import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private apiUrl = 'http://localhost:5177/api/subscriber';
  
  constructor(private http : HttpClient) { }

  sendData(form: any) : Observable<any>{
    return this.http.post(`${this.apiUrl}`, form)
  }

  getGeolocation(lat: number, lon: number): Observable<any> {
  const url = `${this.apiUrl}/reverse-geocode?lat=${lat}&lon=${lon}`;
  return this.http.get(url);
}
}
