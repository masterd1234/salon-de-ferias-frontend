import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://backend-node-wpf9.onrender.com/auth';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any) {}

  login(nameOrEmail: string, password: string): Observable<{ success: boolean; message: string; user?: { name: string; rol: string } }> {
    return this.http.post<{ message: string; user: { name: string; rol: string } }>(
      `${this.apiUrl}/login`,
      { nameOrEmail, password },
      { withCredentials: true }
    ).pipe(
      map((response) => {
        // Guardar en localStorage si estamos en el navegador
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        return { success: true, message: response.message, user: response.user };
      }),
      catchError((error: any) => {
        const errorMessage = error.error?.message || 'Error desconocido al iniciar sesión';
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isLoggedIn', 'false');
        }
        return of({ success: false, message: errorMessage });
      }),
    );
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  }

  getUser(): { name: string; rol: string } | null {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Cierre de sesión exitoso');
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
        }
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
        }
      }
    });
  }
}
