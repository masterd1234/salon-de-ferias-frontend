import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

/**
 * @class AuthService
 * @description Servicio de autenticación que gestiona el inicio de sesión, almacenamiento de tokens,
 * decodificación de tokens y cierre de sesión. El token JWT se almacena en `localStorage` si la
 * plataforma es el navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * @property {string} apiUrl - URL del backend para el endpoint de autenticación (login).
   * @private
   */
  private apiUrl = 'https://backend-node-wpf9.onrender.com/auth/login';

  /**
   * @property {string | null} token - Almacena el token JWT en memoria.
   * @private
   */
  private token: string | null = null;

  /**
   * @constructor
   * @param {HttpClient} http - Servicio HttpClient para realizar peticiones HTTP.
   * @param {Object} platformId - Identificador de la plataforma, usado para comprobar si estamos en un navegador.
   */
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * @method login
   * @description Envía las credenciales de inicio de sesión al backend y almacena el token JWT si la autenticación es exitosa.
   * @param {string} nameOrEmail - Nombre de usuario o correo electrónico.
   * @param {string} password - Contraseña del usuario.
   * @returns {Observable<any>} Observable con la respuesta de autenticación del backend.
   */
  login(nameOrEmail: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { nameOrEmail, password }).pipe(
      tap({
        next: (response: any) => {
          if (response.token) {
            console.log('Token recibido:', response.token);  // Confirmación de recepción del token
            this.setToken(response.token); // Guarda el token
          }
        },
        error: (err) => {
          console.error('Error en la autenticación:', err);
        }
      })
    );
  }

  /**
   * @method setToken
   * @description Guarda el token JWT en `localStorage` (si estamos en el navegador) y en una propiedad local.
   * @param {string} token - Token JWT a almacenar.
   * @returns {void}
   */
  setToken(token: string): void {
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token); 
    }
  }

  /**
   * @method getToken
   * @description Obtiene el token JWT de `localStorage` si estamos en el navegador, o desde la propiedad `token` en memoria.
   * @returns {string | null} El token JWT almacenado o `null` si no existe.
   */
  getToken(): string | null {
    if (!this.token && isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  /**
   * @method decodeToken
   * @description Decodifica el token JWT para obtener los datos de carga útil, como el rol del usuario.
   * @returns {any} Datos decodificados del token JWT o `null` si no hay token.
   */
  decodeToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);  // Decodifica el token JWT
    }
    return null;
  }

  /**
   * @method logout
   * @description Elimina el token JWT tanto de `localStorage` como de la propiedad local, cerrando la sesión del usuario.
   * @returns {void}
   */
  logout(): void {
    this.token = null;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }
}
