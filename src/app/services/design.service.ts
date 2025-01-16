import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private http = inject(HttpClient);
  // private apiUrl = 'https://backend-node-wpf9.onrender.com/design'
  private apiUrl = `${environment.url}/design`;

  /**
   * @method addDesign
   * @description Agrega un diseño para una empresa en el sistema. Este diseño incluye identificadores de stand y modelo,
   * y opcionalmente archivos de banner y póster.
   *
   * @param {FormData} designData - Datos del diseño, que incluyen `standID`, `modelID`, y opcionalmente `banner` y `poster`.
   * @param {string} [id] - ID opcional para los administradores que desean especificar una empresa.
   * @returns {Observable<{ success: boolean; message: string; idDesign?: string }>}
   * Observable con la respuesta del servidor.
   *
   * #### Respuestas del backend:
   * - **200 (OK)**: Diseño añadido exitosamente al sistema.
   * - **400 (Bad Request)**: Faltan `standID` o `modelID`.
   * - **403 (Forbidden)**: Acceso denegado (los visitantes no pueden agregar diseños).
   * - **404 (Not Found)**: La empresa o recurso especificado no existe.
   * - **500 (Internal Server Error)**: Error interno en el servidor.
   */
  addDesign(
    designData: FormData,
    id?: string
  ): Observable<{ success: boolean; message: string; idDesign?: string }> {
    const url = id
      ? `${this.apiUrl}/addDesign/${id}`
      : `${this.apiUrl}/addDesign`;

    return this.http
      .post<{ message: string; idDesign: string }>(url, designData, {
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          success: true,
          message: response.message,
          idDesign: response.idDesign,
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error desconocido al agregar el diseño';
          return of({ success: false, message: errorMessage });
        })
      );
  }

  /**
   * @method getDesign
   * @description Obtiene el diseño asociado a una empresa a través del ID proporcionado.
   * @param {string} [id] - ID opcional de la empresa (necesario para administradores y visitantes).
   * @returns {Observable<{ success: boolean; data?: any; message?: string }>}
   * Observable que contiene el diseño en caso de éxito o un mensaje de error.
   *
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Diseño obtenido exitosamente.
   * - **400 (Bad Request)**: Falta el parámetro `id` (si es obligatorio).
   * - **403 (Forbidden)**: Acceso denegado.
   * - **404 (Not Found)**: Diseño no encontrado.
   * - **500 (Internal Server Error)**: Error en el servidor.
   */
  getDesign(
    id?: string
  ): Observable<{ success: boolean; data?: any; message?: string }> {
    const url = id
      ? `${this.apiUrl}/getDesign/${id}`
      : `${this.apiUrl}/getDesign`;

    return this.http.get<any>(url, { withCredentials: true }).pipe(
      map((response) => ({
        success: true,
        data: response, // Incluye los datos del diseño
      })),
      catchError((error) => {
        const errorMessage =
          error.error?.message || 'Error desconocido al obtener el diseño';
        return of({
          success: false,
          message: errorMessage,
        });
      })
    );
  }

  /**
   * @method getAllDesigns
   * @description Obtiene todos los diseños almacenados en el backend. Este endpoint solo está accesible para administradores.
   * @returns {Observable<{ success: boolean; data?: any[]; message?: string }>}
   * Observable con los diseños obtenidos o un mensaje de error en caso de fallo.
   *
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Diseños obtenidos exitosamente.
   * - **403 (Forbidden)**: Acceso denegado (solo administradores pueden acceder).
   * - **500 (Internal Server Error)**: Error en el servidor al obtener los diseños.
   */
  getAllDesigns(): Observable<{
    success: boolean;
    data?: any[];
    message?: string;
  }> {
    const url = `${this.apiUrl}/allDesigns`;

    return this.http.get<any[]>(url, { withCredentials: true }).pipe(
      map((response) => ({
        success: true,
        data: response, // Devuelve la lista de diseños
      })),
      catchError((error) => {
        const errorMessage =
          error.error?.message || 'Error desconocido al obtener los diseños';
        return of({ success: false, message: errorMessage });
      })
    );
  }

  /**
   * @method updateDesign
   * @description Actualiza un diseño asociado a una empresa. Admite actualización de `standID`, `modelID` y archivos opcionales (`banner`, `poster`, `logo`).
   * @param {FormData} designData - Datos del diseño, incluyendo campos requeridos y opcionales.
   * @param {string} [id] - ID del diseño a actualizar. No es necesario para usuarios de tipo 'company'.
   * @returns {Observable<{ success: boolean; updatedDesign?: any; message?: string }>}
   * Observable con el estado de la operación, datos del diseño actualizado (si es exitoso), y un mensaje de error (si falla).
   */
  updateDesign(
    designData: FormData,
    id?: string
  ): Observable<{ success: boolean; updatedDesign?: any; message?: string }> {
    const url = id
      ? `${this.apiUrl}/updateDesign/${id}`
      : `${this.apiUrl}/updateDesign`;

    return this.http.put<any>(url, designData, { withCredentials: true }).pipe(
      map((response) => ({
        success: true,
        updatedDesign: response.updatedDesign,
        message: response.message,
      })),
      catchError((error) => {
        const errorMessage =
          error.error?.message || 'Error desconocido al actualizar el diseño';
        return of({ success: false, message: errorMessage });
      })
    );
  }

  /**
   * @method deleteDesign
   * @description Elimina un diseño asociado a una empresa.
   * @param {string} id - ID del diseño que se desea eliminar. Obligatorio para usuarios con permisos de admin.
   * @returns {Observable<{ success: boolean; message?: string }>}
   * Observable con el estado de la operación y un mensaje en caso de éxito o error.
   */
  deleteDesign(id: string): Observable<{ success: boolean; message?: string }> {
    const url = `${this.apiUrl}/deleteDesign/${id}`;

    return this.http
      .delete<{ message: string }>(url, { withCredentials: true })
      .pipe(
        map((response) => ({
          success: true,
          message: response.message,
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error desconocido al eliminar el diseño';
          return of({ success: false, message: errorMessage });
        })
      );
  }

  /**
   * Obtiene todos los stands disponibles.
   *
   * @returns {Observable<{ success: boolean; data?: any; message?: string }>}
   * Observable con el estado de la operación, los datos de los stands (en caso de éxito),
   * y un mensaje de error (en caso de fallo).
   *
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Lista de stands obtenida exitosamente.
   * - **404 (Not Found)**: No se encontraron stands.
   * - **500 (Internal Server Error)**: Error en el servidor al obtener los stands.
   */
  getAllStands(): Observable<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    const url = `${this.apiUrl}/stand`;

    return this.http.get<any>(url).pipe(
      map((response) => ({
        success: true,
        data: response, // Devuelve directamente la lista de stands
      })),
      catchError((error) => {
        const errorMessage =
          error.error?.message || 'Error desconocido al obtener los stands';
        return of({
          success: false,
          message: errorMessage,
        });
      })
    );
  }

  /**
   * Obtiene todos los modelos disponibles.
   *
   * @returns {Observable<{ success: boolean; data?: any; message?: string }>}
   * Observable con el estado de la operación, los datos de los modelos (en caso de éxito),
   * y un mensaje de error (en caso de fallo).
   *
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Lista de modelos obtenida exitosamente.
   * - **404 (Not Found)**: No se encontraron modelos.
   * - **500 (Internal Server Error)**: Error en el servidor al obtener los modelos.
   */
  getAllModels(): Observable<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    const url = `${this.apiUrl}/model`;

    return this.http.get<any>(url).pipe(
      map((response) => ({
        success: true,
        data: response, // Devuelve directamente la lista de modelos
      })),
      catchError((error) => {
        const errorMessage =
          error.error?.message || 'Error desconocido al obtener los modelos';
        return of({
          success: false,
          message: errorMessage,
        });
      })
    );
  }
}
