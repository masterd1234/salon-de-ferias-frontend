import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Usuario } from '../../models/users.model';

/**
 * @class UserService
 * @description Servicio que permite gestionar los usuarios en la aplicación, proporcionando métodos
 * para obtener, crear, actualizar y eliminar usuarios. Utiliza autenticación basada en tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * @property {string} apiUrl - URL base de la API para la gestión de usuarios.
   * @private
   */
  private apiUrl = 'https://backend-node-wpf9.onrender.com/users';

  /**
   * @constructor
   * @param {HttpClient} http - Servicio HttpClient para realizar peticiones HTTP.
   * @param {AuthService} authService - Servicio AuthService para obtener el token de autenticación.
   */
  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * @private
   * @method getHeaders
   * @description Genera y retorna los encabezados de la petición HTTP con el token de autenticación incluido.
   * @returns {HttpHeaders} Encabezados con el token de autenticación y el tipo de contenido JSON.
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * @method getUsers
   * @description Recupera una lista de usuarios desde la API.
   * @returns {Observable<Usuario[]>} Observable con la lista de usuarios o un array vacío en caso de error.
   */
  getUsers(): Observable<Usuario[]> {
    const headers = this.getHeaders();
    return this.http.get<Usuario[]>(this.apiUrl, { headers }).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios', error);
        return of([]);  // Retorna un array vacío en caso de error
      })
    );
  }

  /**
   * @method createUser
   * @description Crea un nuevo usuario en la API.
   * @param {Usuario} user - Objeto con los datos del usuario a crear.
   * @returns {Observable<Usuario | null>} Observable con el usuario creado o `null` en caso de error.
   */
  createUser(user: Usuario): Observable<Usuario | null> {
    const headers = this.getHeaders();
    return this.http.post<Usuario>(this.apiUrl, user, { headers }).pipe(
      tap(() => this.getUsers()),  // Actualiza la lista después de crear
      catchError(error => {
        console.error('Error al crear usuario', error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }

  /**
   * @method deleteUser
   * @description Elimina un usuario de la API según su ID.
   * @param {string} id - ID del usuario a eliminar.
   * @returns {Observable<any>} Observable con la respuesta de la API o `null` en caso de error.
   */
  deleteUser(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(error => {
        console.error(`Error al eliminar usuario con ID: ${id}`, error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }

  /**
   * @method updateUser
   * @description Actualiza un usuario en la API según su ID.
   * @param {string} id - ID del usuario a actualizar.
   * @param {Partial<Usuario>} updatedData - Objeto con los datos del usuario a actualizar.
   * @returns {Observable<Usuario | null>} Observable con el usuario actualizado o `null` en caso de error.
   */
  updateUser(id: string, updatedData: Partial<Usuario>): Observable<Usuario | null> {
    const headers = this.getHeaders();
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, updatedData, { headers }).pipe(
      catchError(error => {
        console.error(`Error al actualizar usuario con ID: ${id}`, error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }

  /**
   * @method getUserById
   * @description Recupera un usuario específico desde la API según su ID.
   * @param {string} id - ID del usuario a obtener.
   * @returns {Observable<Usuario | null>} Observable con los datos del usuario o `null` en caso de error.
   */
  getUserById(id: string): Observable<Usuario | null> {
    const headers = this.getHeaders();
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(error => {
        console.error(`Error al obtener usuario con ID: ${id}`, error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }
}
