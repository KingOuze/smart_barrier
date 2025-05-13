import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoitureService {
  private apiUrl = environment.url +'/voitures';

  constructor(private http: HttpClient) { }

  createVoiture(voiture: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, voiture, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  getVoitures(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  getVoiture(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  updateVoiture(id: string, voiture: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, voiture, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Archiver ou désarchiver une voiture
  archiveVoiture(id: string, action: string): Observable<any> {
    const url = action === 'archive' ? `${this.apiUrl}/archive/${id}` : `${this.apiUrl}/unarchive/${id}`;
    return this.http.patch(url, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }
}
