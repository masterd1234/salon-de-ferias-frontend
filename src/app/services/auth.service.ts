import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import {jwtDecode} from 'jwt-decode';

/**
 * @class AuthService
 * @description Servicio de autenticación que gestiona el inicio de sesión, almacenamiento de tokens JWT en cookies,
 * decodificación de tokens y cierre de sesión. Usa cookies para mayor seguridad y compatibilidad en el navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * @private
   * @property {string} apiUrl - URL del backend para el endpoint de autenticación (login).
   */
  private apiUrl = 'https://backend-node-wpf9.onrender.com/auth/login';

  /**
   * @private
   * @property {string | null} token - Almacena el token JWT en memoria.
   */
  private token: string | null = null;

  /**
   * @constructor
   * @param {HttpClient} http - Servicio HttpClient para realizar peticiones HTTP.
   * @param {CookieService} cookieService - Servicio para gestionar cookies.
   * @param {Object} platformId - Identificador de la plataforma, usado para comprobar si estamos en un navegador.
   */
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * @method login
   * @description Envía las credenciales de inicio de sesión al backend y almacena el token JWT en una cookie si la autenticación es exitosa.
   * @param {string} nameOrEmail - Nombre de usuario o correo electrónico.
   * @param {string} password - Contraseña del usuario.
   * @returns {Observable<any>} Observable con la respuesta de autenticación del backend.
   * @example
   * authService.login('usuario@example.com', 'contraseña123').subscribe(
   *   response => console.log('Autenticado con éxito', response),
   *   error => console.error('Error en el inicio de sesión', error)
   * );
   */
  login(nameOrEmail: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { nameOrEmail, password }).pipe(
      tap({
        next: (response: any) => {
          if (response.token) {
            console.log('Token recibido:', response.token);
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
   * @description Almacena el token JWT en una cookie con una duración de 3 días.
   * @param {string} token - Token JWT a almacenar.
   * @returns {void}
   */
  setToken(token: string): void {
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 3); // Configura la cookie para que dure 3 días

      this.cookieService.set('token', token, {
        expires,
        path: '/', // Disponible en toda la aplicación
        secure: true, // Solo en conexiones HTTPS
        sameSite: 'Strict', // Prevención básica contra CSRF
      });
    }
  }

  /**
   * @method getToken
   * @description Recupera el token JWT desde una cookie.
   * @returns {string | null} El token JWT almacenado o `null` si no existe.
   * @example
   * const token = authService.getToken();
   * console.log('Token:', token);
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      this.token = this.cookieService.get('token') || null;
    }
    return this.token;
  }

  /**
   * @method decodeToken
   * @description Decodifica el token JWT almacenado para obtener información del usuario, como el rol o el ID.
   * @returns {any} Datos decodificados del token JWT o `null` si no hay token.
   * @example
   * const decoded = authService.decodeToken();
   * console.log('Datos decodificados:', decoded);
   */
  decodeToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token); // Decodifica el token JWT
    }
    return null;
  }

  /**
   * @method logout
   * @description Elimina el token JWT tanto de la cookie como de la propiedad local, cerrando la sesión del usuario.
   * @returns {void}
   * @example
   * authService.logout();
   * console.log('Sesión cerrada');
   */
  logout(): void {
    this.token = null;
    if (isPlatformBrowser(this.platformId)) {
      this.cookieService.delete('token', '/'); // Elimina la cookie
    }
  }
}
