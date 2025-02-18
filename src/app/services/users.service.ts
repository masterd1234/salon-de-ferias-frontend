import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Usuario } from '../../models/users.model';

import { environment } from '../../environments/environment';

/**
 * @class UserService
 * @description Servicio que permite gestionar los usuarios en la aplicación, proporcionando métodos
 * para obtener, crear, actualizar y eliminar usuarios. Utiliza autenticación basada en cookies.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * @property {string} apiUrl - URL base de la API para la gestión de usuarios.
   * @private
   */
  // private apiUrl = 'https://backend-node-wpf9.onrender.com/users';
  private apiUrl = `${environment.url}/users`;

  /**
   * @constructor
   * @param {HttpClient} http - Servicio HttpClient para realizar peticiones HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * @method createUser
   * @description Crea un nuevo usuario en la API.
   * @param {Usuario} user - Objeto con los datos del usuario a crear.
   * @returns {Observable<Usuario | null>} Observable con el usuario creado o `null` en caso de error.
   */
  createUser(user: FormData): Observable<Usuario | null> {
    return this.http.post<Usuario>(`${this.apiUrl}/register`, user, {
      withCredentials: true,
    });
  }

  /**
   * @method getAllUsersByType
   * @description Recupera usuarios según el tipo proporcionado.
   * @param {'companies' | 'visitors' | 'admins' | 'all'} userType - Tipo de usuarios a obtener.
   * @returns {Observable<Usuario[]>} Observable con los usuarios o lista vacía en caso de error.
   */
  getAllUsersByType(
    userType: 'companies' | 'visitors' | 'admins' | 'all'
  ): Observable<Usuario[]> {
    return this.http
      .get<{ users: Usuario[] }>(`${this.apiUrl}/${userType}`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.users || []), // Extrae la propiedad `users` o usa un array vacío
        catchError((error) => {
          console.error(
            `Error al obtener usuarios del tipo ${userType}:`,
            error
          );
          return of([]); // Retorna lista vacía en caso de error
        })
      );
  }

  /**
   * @method getUserById
   * @description Recupera un usuario específico desde la API.
   * @param {string} [id] - ID del usuario a obtener. Si no se proporciona, se usará el ID del token.
   * @returns {Observable<Usuario | null>} Observable con el usuario o `null` en caso de error.
   */
  getUserById(id?: string): Observable<Usuario | null> {
    const url = id ? `${this.apiUrl}/${id}` : this.apiUrl;
    return this.http
      .get<{ user: Usuario }>(url, { withCredentials: true })
      .pipe(
        map((response) => response.user || null), // Extrae solo el campo 'user'
        catchError((error) => {
          console.error('Error al obtener usuario');
          return of(null);
        })
      );
  }

  updateLogo(logo: File, userId?: string): Observable<any> {
    const url = userId
      ? `${this.apiUrl}/users/logo/${userId}`
      : `${this.apiUrl}/users/logo`;
    return this.http.put<any>(url, logo, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al actualizar el logo:', error);
        return of(null); // Retorna null en caso de error
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
    return this.http
      .delete(`${this.apiUrl}/${id}`, { withCredentials: true })
      .pipe(
        tap(() => this.getAllUsersByType('all')),
        catchError((error) => {
          console.error(`Error al eliminar usuario con ID: ${id}`, error);
          return of(null); // Retorna null en caso de error
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
  updateUser(
    id: string,
    updatedData: Partial<Usuario>
  ): Observable<Usuario | null> {
    return this.http
      .put<Usuario>(`${this.apiUrl}/${id}`, updatedData, {
        withCredentials: true,
      })
      .pipe(
        tap(() => this.getAllUsersByType('all')),
        catchError((error) => {
          console.error(`Error al actualizar usuario con ID: ${id}`, error);
          return of(null); // Retorna null en caso de error
        })
      );
  }

  updateCompany(
    companyData: Usuario,
    id?: string
  ): Observable<{ success: boolean; data?: Usuario; message?: string }> {
    const url = id ? `${this.apiUrl}/${id}` : `${this.apiUrl}`;
    console.log(id);
    return this.http
      .put<{ message: string; updatedData: Usuario }>(url, companyData, {
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          success: true,
          data: response.updatedData, // Información actualizada de la empresa
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message ||
            'Error desconocido al actualizar la información';
          return of({
            success: false,
            message: errorMessage,
          });
        })
      );
  }

  addUserInformation(userData: Usuario, id?: string): Observable<any> {
    const url = id ? `${this.apiUrl}/users/${id}` : `${this.apiUrl}/users`;
    return this.http
      .post<{ message: string; id: string }>(url, userData, {
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          success: true,
          message: response.message,
          id: response.id,
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message ||
            'Error desconocido al agregar la información';
          return of({ success: false, message: errorMessage });
        })
      );
  }
}
