import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  /**
   * Obtiene el valor de una cookie por su nombre.
   * @param name Nombre de la cookie.
   * @returns Valor de la cookie o null si no existe.
   */
  getCookie(name: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const matches = document.cookie.match(
        new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`)
      );
      return matches ? decodeURIComponent(matches[1]) : null;
    }
    return null;
  }

  /**
   * Verifica si el usuario está autenticado comprobando la existencia de una cookie.
   * @returns {Observable<boolean>} `true` si el usuario está autenticado, de lo contrario `false`.
   */
  isAuthenticated(): Observable<boolean> {
    const token = this.getCookie('authToken'); // Reemplaza 'authToken' con el nombre de tu cookie
    return of(!!token); // Convierte el valor booleano en un Observable
  }

  /**
   * Decodifica el payload de un token JWT.
   * @param token El token JWT.
   * @returns Datos decodificados del token o null si es inválido.
   */
  decodeJWT(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error al decodificar el JWT:', error);
      return null;
    }
  }

  /**
   * Obtiene y decodifica el JWT desde una cookie.
   * @param cookieName Nombre de la cookie que contiene el JWT.
   * @returns Datos del JWT o null si no existe o no es válido.
   */
  getDecodedToken(cookieName: string): any | null {
    const token = this.getCookie(cookieName);
    return token ? this.decodeJWT(token) : null;
  }
}
