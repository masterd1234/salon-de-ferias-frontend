import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/login';  // URL del backend para login
  private token: string | null = null;  // Almacenamos el token JWT aquí

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object  // Verifica si estamos en el navegador
  ) {}

  // Método de login que envía las credenciales al backend
  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { nombre: username, contraseña: password }).pipe(
      tap({
        next: (response: any) => {
          if (response.token) {
            console.log('Token recibido:', response.token);  // Asegúrate de que el token se recibe correctamente
            this.setToken(response.token); // Guardar el token
          }
        },
        error: (err) => {
          console.error('Error en la autenticación:', err);
        }
      })
    );
  }

  // Guardar el token JWT en localStorage si está disponible
  setToken(token: string): void {
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token); 
    }
  }

  // Obtener el token JWT almacenado desde localStorage
  getToken(): string | null {
    if (!this.token && isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  //Descodificar el TOKEN
  decodeToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);  // Decodifica el token JWT
    }
    return null;
  }

  // Método para cerrar sesión y limpiar el token
  logout(): void {
    this.token = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }
}
