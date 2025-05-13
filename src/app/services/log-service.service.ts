import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from '../log';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private logUrl = environment.url +'/logs';

  constructor(private http: HttpClient) {}

  logLogin(userId: string) {
    this.http.post(`${this.logUrl}/login`, { userId }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      }).subscribe(
      () => console.log('Connexion enregistrée'),
      (error) => console.log('Erreur lors de l\'enregistrement de la connexion', error)
    );
  }

  logAction(userId: any, type: string,  entityId: any) {
    this.http.post(`${this.logUrl}/log-action`, { userId, type, entityId }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      }).subscribe(
      () => console.log('Action enregistrée'),
      (error) => console.log('Erreur lors de l\'enregistrement de l\'action', error)
    );
  }

  getLogs(): Observable<Log> {
    return this.http.get<Log>(`${this.logUrl}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  getActions(userId: string, logoutTime: string): Observable<Log> {
    return this.http.get<Log>(`${this.logUrl}/${userId}/${logoutTime}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }



  logLogout(userId: string) {
    this.http.post(`${this.logUrl}/logout`, { userId }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      }).subscribe(
      () => console.log('Déconnexion enregistrée'),
      (error) =>console.log('Erreur lors de l\'enregistrement de la déconnexion', error)
    );
  }

}
