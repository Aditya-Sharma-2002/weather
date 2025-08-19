import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private apiUrl = environment.server + '/subscriber';
  
  constructor(private http : HttpClient) { }

  sendData(form: any) : Observable<any>{
    return this.http.post(`${this.apiUrl}`, form)
  }

  getGeolocation(lat: number, lon: number): Observable<any> {
  const url = `${this.apiUrl}/reverse-geocode?lat=${lat}&lon=${lon}`;
  return this.http.get(url);
}
}
