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

  getUserById(id?: string): Observable<Usuario | null> {
    const url = id ? `${this.apiUrl}/${id}` : this.apiUrl;
    // const url = `${this.apiUrl}/fEAtwhP0DwbpO0mLnsks`;
    return this.http
      .get<{ user: Usuario }>(url, { withCredentials: true })
      .pipe(
        map((response) => response.user || null), // Extrae solo el campo 'user'
        catchError((error) => {
          console.error('Error al obtener usuario', error);
          return of(null);
        })
      );
  }
}
