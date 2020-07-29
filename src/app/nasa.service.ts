import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NasaService {

  constructor(private http: HttpClient) { }

  getAsteroids(startDate, endDate) {
    let url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate.toISOString().substr(0, 10)}&end_date=${endDate.toISOString().substr(0, 10)}&api_key=${environment.nasaApiKey}`;
    return this.http.get(url);
  }
}
