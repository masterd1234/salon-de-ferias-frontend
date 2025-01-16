import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

/**
 * @class VideoService
 * @description Este servicio maneja la lógica para interactuar con la API de videos,
 * permitiendo agregar y recuperar URLs de videos. Las solicitudes incluyen cookies automáticamente para autenticación.
 */
@Injectable({
  providedIn: 'root',
})
export class VideoService {
  /**
   * @property {string} apiUrl - URL base de la API para la gestión de videos.
   * @private
   */
  // private apiUrl = 'https://backend-node-wpf9.onrender.com/video';
  private apiUrl = `${environment.url}/video`;

  /**
   * @constructor
   * @param {HttpClient} http - Servicio HttpClient para realizar peticiones HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * @method addVideo
   * @description Añade un nuevo video a la lista de videos de una empresa.
   * Si el usuario es un administrador, el `id` de la empresa debe proporcionarse.
   *
   * @param {string} videoUrl - URL del video a añadir.
   * @param {string} [id] - ID opcional de la empresa (requerido solo para administradores).
   * @returns {Observable<{ success: boolean; message: string; id?: string; urls?: string[] }>}
   * Observable con:
   * - `success`: Indica si la operación fue exitosa.
   * - `message`: Mensaje de la operación.
   * - `id`: ID del documento de video en caso de éxito.
   * - `urls`: Lista de URLs de videos actualizados en caso de éxito.
   *
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Video añadido al array existente.
   * - **201 (Created)**: Documento de video creado y video añadido.
   * - **400 (Bad Request)**: Falta la URL del video o el video ya existe en la lista.
   * - **403 (Forbidden)**: Visitantes no tienen permiso para añadir videos.
   */
  addVideo(
    videoUrl: string,
    id?: string
  ): Observable<{
    success: boolean;
    message: string;
    id?: string;
    urls?: string[];
  }> {
    const url = id ? `${this.apiUrl}/add/${id}` : `${this.apiUrl}/add`;

    return this.http
      .post<{ message: string; id: string; urls: string[] }>(
        url,
        { url: videoUrl }, // Cuerpo de la solicitud
        { withCredentials: true }
      )
      .pipe(
        map((response) => ({
          success: true,
          message: response.message,
          id: response.id,
          urls: response.urls,
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error desconocido al añadir el video';
          return of({ success: false, message: errorMessage });
        })
      );
  }

  /**
   * @method getVideosByCompanyId
   * @description Obtiene la lista de videos asociados a una empresa por su ID.
   *
   * @param {string} id - ID de la empresa. Es obligatorio para administradores y visitantes.
   * @returns {Observable<{ success: boolean; videos?: Array<{ id: string; companyID: string; urls: string[] }>; message?: string }>}
   * Observable con:
   * - `success`: Indica si la operación fue exitosa.
   * - `videos`: Lista de videos en caso de éxito.
   * - `message`: Mensaje de error o éxito.
   *
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Lista de videos obtenida exitosamente.
   * - **400 (Bad Request)**: Falta el `companyID`.
   * - **403 (Forbidden)**: El usuario no tiene permisos para ver videos.
   * - **404 (Not Found)**: No se encontraron videos para la compañía.
   */
  getVideosByCompanyId(
    id?: string
  ): Observable<{
    success: boolean;
    videos?: Array<{ id: string; companyID: string; urls: string[] }>;
    message?: string;
  }> {
    const url = id ? `${this.apiUrl}/company/${id}` : `${this.apiUrl}/company`;

    return this.http
      .get<Array<{ id: string; companyID: string; urls: string[] }>>(url, {
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          success: true,
          videos: response,
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error desconocido al obtener los videos';
          return of({ success: false, message: errorMessage });
        })
      );
  }

  /**
   * @method deleteVideo
   * @description Elimina una URL de video asociada a una compañía.
   * @param {string} url - La URL del video a eliminar.
   * @param {string} [id] - ID opcional de la compañía (obligatorio para administradores).
   * @returns {Observable<{ success: boolean; message: string; removedUrl?: string }>}
   * Observable con el estado de la operación, el mensaje y la URL eliminada (si tiene éxito).
   */
  deleteVideo(
    url: string,
    id?: string
  ): Observable<{ success: boolean; message: string; removedUrl?: string }> {
    const urlEndpoint = id
      ? `${this.apiUrl}/delete/${id}`
      : `${this.apiUrl}/delete`;
    const body = { url };

    return this.http
      .delete<{ message: string; removedUrl: string }>(urlEndpoint, {
        body,
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          success: true,
          message: response.message,
          removedUrl: response.removedUrl,
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error desconocido al eliminar el video';
          return of({ success: false, message: errorMessage });
        })
      );
  }
}
