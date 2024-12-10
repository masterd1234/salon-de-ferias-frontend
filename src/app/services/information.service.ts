import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Company, selection } from '../../models/company.model';

/**
 * @class CompanyService
 * @description Este servicio permite gestionar la información de empresas, proporcionando métodos para añadir una empresa, añadir datos específicos de selección y obtener información de empresas.
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  /**
   * @property {string} apiUrl - URL base de la API para la gestión de empresas.
   * @private
   */
  private apiUrl = 'https://backend-node-wpf9.onrender.com/information';

  /**
   * @constructor
   * @param {HttpClient} http - Servicio HttpClient para realizar peticiones HTTP.
   */
  constructor(private http: HttpClient) { }

  /**
   * @method addCompany
   * @description Envía los datos de una nueva empresa al backend para ser almacenados.
   * @param {Company} companyData - Objeto con los datos de la empresa a añadir.
   * @returns {Observable<any>} Observable con la respuesta de la API.
   */
  addCompanyInformation(companyData: Company, id?: string): Observable<any> {
    const url = id ? `${this.apiUrl}/addInfo/${id}` : `${this.apiUrl}/addInfo`;
    return this.http.post<{ message: string; id: string }>(url, companyData, { withCredentials: true }).pipe(
      map((response) => ({
        success: true,
        message: response.message,
        id: response.id,
      })),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error desconocido al agregar la información';
        return of({ success: false, message: errorMessage });
      })
    );
  }

  /**
   * Obtiene información de una empresa. Para administradores y visitantes, el `id` es obligatorio.
   * 
   * @param {string} [id] - ID opcional de la empresa (obligatorio para algunos roles).
   * @returns {Observable<{ success: boolean; data?: Company; message?: string }>} 
   * Observable con el estado de la operación, los datos de la empresa (en caso de éxito), y un mensaje de error (en caso de fallo).
   * 
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Información obtenida exitosamente.
   * - **400 (Bad Request)**: Falta el `id` (si es obligatorio).
   * - **404 (Not Found)**: Empresa no encontrada.
   * - **500 (Internal Server Error)**: Error en el servidor.
   */
  getInformation(id?: string): Observable<{ success: boolean; data?: Company; message?: string }> {
    const url = id ? `${this.apiUrl}/getInfo/${id}` : `${this.apiUrl}/getInfo`;

    return this.http.get<Company>(url, { withCredentials: true }).pipe(
      map((response: Company) => ({
        success: true,
        data: response, // Devuelve directamente la información de la empresa
      })),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error desconocido al obtener la información';
        return of({ success: false, message: errorMessage });
      })
    );
  }


  /**
   * @method updateCompany
   * @description Actualiza la información de la empresa en el backend. 
   * Si el usuario es un administrador, puede especificar un `id` para actualizar una empresa específica.
   * 
   * @param {Company} companyData - Objeto con los datos actualizados de la empresa.
   * @param {string} [id] - ID opcional de la empresa (requerido solo para administradores).
   * @returns {Observable<{ success: boolean; data?: Company; message?: string }>} 
   * Observable con:
   * - `success`: Indica si la operación fue exitosa.
   * - `data`: Objeto `Company` actualizado, en caso de éxito.
   * - `message`: Mensaje de error en caso de fallo.
   * 
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Actualización exitosa.
   * - **400 (Bad Request)**: Datos inválidos, e.g., enlaces incompletos.
   * - **404 (Not Found)**: Empresa no encontrada.
   * - **500 (Internal Server Error)**: Error en el servidor.
   */
  updateCompany(companyData: Company, id?: string): Observable<{ success: boolean; data?: Company; message?: string }> {
    const url = id ? `${this.apiUrl}/updateInfo/${id}` : `${this.apiUrl}/updateInfo`;

    return this.http.put<{ message: string; updatedData: Company }>(url, companyData, { withCredentials: true }).pipe(
      map((response) => ({
        success: true,
        data: response.updatedData, // Información actualizada de la empresa
      })),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error desconocido al actualizar la información';
        return of({
          success: false,
          message: errorMessage,
        });
      })
    );
  }

  /**
 * @method deleteDocuments
 * @description Elimina documentos innecesarios de una empresa, conservando solo los especificados en el arreglo `documentsToKeep`.
 * 
 * @param {string} id - ID de la empresa (obligatorio para administradores).
 * @param {Array<{ fileName: string }>} documentsToKeep - Array con los documentos que deben conservarse.
 * @returns {Observable<{ success: boolean; message: string; updatedDocuments?: Array<{ fileName: string }> }>} 
 * Observable con el estado de la operación, el mensaje y los documentos actualizados en caso de éxito.
 * 
 * #### Posibles Respuestas del Backend:
 * - **200 (OK)**: Documentos actualizados con éxito.
 * - **400 (Bad Request)**: Faltan datos requeridos (e.g., el arreglo `documentsToKeep`).
 * - **404 (Not Found)**: Empresa no encontrada.
 * - **500 (Internal Server Error)**: Error en el servidor.
 */
  deleteDocuments(
    id: string,
    documentsToKeep: Array<{ fileName: string }>
  ): Observable<{ success: boolean; message: string; updatedDocuments?: Array<{ fileName: string }> }> {
    const url = `${this.apiUrl}/deleteDocuments/${id}`;

    return this.http.put<{ success: boolean; message: string; updatedDocuments: Array<{ fileName: string }> }>(
      url,
      { documentsToKeep }, // Datos enviados en el cuerpo de la solicitud
      { withCredentials: true }
    ).pipe(
      map((response) => ({
        success: true,
        message: response.message,
        updatedDocuments: response.updatedDocuments,
      })),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error desconocido al eliminar documentos';
        return of({ success: false, message: errorMessage });
      })
    );
  }

  /**
   * @method updateDocuments
   * @description Actualiza los documentos de una empresa, subiendo nuevos documentos proporcionados en el cuerpo de la solicitud.
   * 
   * @param {FormData} formData - Datos en formato `FormData` que contienen los nuevos documentos.
   * @param {string} [id] - ID opcional de la empresa (requerido solo para administradores).
   * @returns {Observable<{ success: boolean; message: string; updatedDocuments?: Array<{ fileName: string; url: string }> }>} 
   * Observable con:
   * - `success`: Indica si la operación fue exitosa.
   * - `message`: Mensaje de la operación.
   * - `updatedDocuments`: Array con los documentos actualizados en caso de éxito.
   * 
   * #### Posibles Respuestas del Backend:
   * - **200 (OK)**: Documentos actualizados con éxito.
   * - **400 (Bad Request)**: Faltan datos requeridos (e.g., el arreglo `newDocuments`).
   * - **404 (Not Found)**: Empresa no encontrada.
   * - **500 (Internal Server Error)**: Error en el servidor.
   */
  updateDocuments(
    formData: FormData,
    id?: string
  ): Observable<{ success: boolean; message: string; updatedDocuments?: Array<{ fileName: string; url: string }> }> {
    const url = id ? `${this.apiUrl}/updateDocuments/${id}` : `${this.apiUrl}/updateDocuments`;

    return this.http.put<{ message: string; updatedDocuments: Array<{ fileName: string; url: string }> }>(
      url,
      formData,
      { withCredentials: true }
    ).pipe(
      map((response) => ({
        success: true,
        message: response.message,
        updatedDocuments: response.updatedDocuments,
      })),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error desconocido al actualizar los documentos';
        return of({ success: false, message: errorMessage });
      })
    );
  }

}
