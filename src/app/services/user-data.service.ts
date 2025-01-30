import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Usuario } from '../../models/users.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private apiUrl = `${environment.url}/users`;

  constructor(private http: HttpClient) {}

  private getUserIdFromLocalStorage(): string | null {
    const userData = localStorage.getItem('user'); // Obtiene el JSON del `localStorage`
    if (!userData) {
      console.warn('⚠️ No se encontró el usuario en localStorage.');
      return null;
    }

    try {
      const user = JSON.parse(userData); // Parsea el JSON a un objeto
      return user.id || null;
    } catch (error) {
      console.error('❌ Error al parsear localStorage:', error);
      return null;
    }
  }

  // getUserById(id?: string): Observable<Usuario | null> {
  //   const url = id ? `${this.apiUrl}/${id}` : this.apiUrl;
  //   // const url = `${this.apiUrl}/fEAtwhP0DwbpO0mLnsks`;
  //   return this.http
  //     .get<{ user: Usuario }>(url, { withCredentials: true })
  //     .pipe(
  //       map((response) => response.user || null), // Extrae solo el campo 'user'
  //       catchError((error) => {
  //         console.error('Error al obtener usuario', error);
  //         return of(null);
  //       })
  //     );
  // }

  getUserById(id?: string): Observable<Usuario | null> {
    const userId = id || this.getUserIdFromLocalStorage(); // Usa el ID de `localStorage` si no se proporciona
    if (!userId) {
      console.error('❌ No se pudo obtener el ID del usuario.');
      return of(null);
    }

    const url = `${this.apiUrl}/${userId}`;
    return this.http
      .get<{ user: Usuario }>(url, { withCredentials: true })
      .pipe(
        map((response) => response.user || null),
        catchError((error) => {
          console.error('❌ Error al obtener usuario:', error);
          return of(null);
        })
      );
  }
}
