import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.url + '/users'; // URL de l'API Node.js

  constructor(private http: HttpClient) {}

  // Créer un utilisateur
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, user, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Modifier un utilisateur
  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Archiver un utilisateur
  archiveUser(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/archive`, {} , {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Désarchiver un utilisateur
  unarchiveUser(id: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/unarchive`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
  })

}
  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
    })
  }

   // Supprimer un utilisateur
   deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }


}
