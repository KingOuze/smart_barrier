import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LogService } from './log-service.service';
import { response } from 'express';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.url+ '/auth'; // URL de l'API Node.js



  constructor(private http: HttpClient, private logService: LogService) { }

  //methode pour la login
  login(credentials: { email: string, motDePasse: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
  }


  // Méthode pour déconnecter
  logout(): void {
    
    this.http.post<any>(`${this.apiUrl}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      }).subscribe((response
      ) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }, (error) => {
        console.error('Erreur lors de la déconnexion : ', error);
      });
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }
    else {
      return null;
    }
  }
 
}
