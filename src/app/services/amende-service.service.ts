import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Amende } from '../amende';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmendeService {

  apiUrl = environment.url;

  constructor(private http: HttpClient) { }

  getAllAmendes() {
    return this.http.get(`${this.apiUrl}/amendes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  updateAmendeStatus(id: any, status: boolean): Observable<Amende> {
    return this.http.patch<Amende>(`${this.apiUrl}/amendes/${id}`, { status }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

}
