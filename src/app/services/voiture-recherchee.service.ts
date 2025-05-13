import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface Voiture {
  _id?: string;
  plaque: string;
  modele: string;
  contact: string;
  archived?: boolean;
  estCible?: boolean;
  organisme: 'police' | 'gendarmerie' | 'ambulance' | 'recherché';
}

@Injectable({
  providedIn: 'root'
})
export class VoitureRechercheeService {

  private apiUrl = environment.url + '/voitures';

  constructor(private http: HttpClient) { }
  /// Créer une voiture recherchée
  createVoitureRecherchee(voiture: Voiture): Observable<Voiture> {
    return this.http.post<Voiture>(`${this.apiUrl}/recherchees`, voiture, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Obtenir toutes les voitures recherchées
  getVoituresRecherchees(): Observable<Voiture[]> {
    return this.http.get<Voiture[]>(`${this.apiUrl}/recherchees`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }
  // Supprimer une voiture recherchée
  deleteVoitureRecherchee(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recherchees/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Archiver une voiture recherchée
  archiverVoitureRecherchee(id: string): Observable<Voiture> {
    return this.http.patch<Voiture>(`${this.apiUrl}/recherchees/archiver/${id}`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Mettre à jour une voiture recherchée
  updateVoitureRecherchee(id: string, updates: Partial<Voiture>): Observable<Voiture> {
    return this.http.put<Voiture>(`${this.apiUrl}/recherchees/${id}`, updates, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }

  // Basculer l'attribut estCible d'une voiture
  toggleEstCible(id: string): Observable<Voiture> {
    return this.http.patch<Voiture>(`${this.apiUrl}/recherchees/toggle-cible/${id}`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }
      });
  }
}
