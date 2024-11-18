import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
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
    private apiUrl = 'https://backend-node-wpf9.onrender.com/company';

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
     * @method addCompany
     * @description Envía los datos de una nueva empresa al backend para ser almacenados.
     * @param {Company} companyData - Objeto con los datos de la empresa a añadir.
     * @returns {Observable<any>} Observable con la respuesta de la API.
     */
    addCompany(companyData: Company): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(this.apiUrl, companyData, { headers });
    }

        /**
     * Actualiza la información de la empresa en el backend.
     * 
     * @function updateCompany
     * @memberof CompanyService
     * @param {Company} companyData - Objeto con los datos actualizados de la empresa.
     * @returns {Observable<any>} 
     * Un Observable con la respuesta de la API tras la actualización.
     * 
     * @example
     * companyService.updateCompany({ name: 'Nueva Empresa', address: 'Nueva Dirección' }).subscribe(response => {
     *   console.log(response.message); // Mensaje de éxito
     * });
     */
    updateCompany(companyData: Company) {
        const headers = this.getHeaders();
        return this.http.post(this.apiUrl, companyData, { headers });
    }

    /**
     * Envía la selección de 'stan' y 'recep' al backend.
     * 
     * @function addStanAndRecep
     * @memberof CompanyService
     * @param {Object} selection - Objeto con los datos de selección a añadir.
     * @returns {Observable<any>} 
     * Un Observable con la respuesta de la API.
     * 
     * @example
     * companyService.addStanAndRecep({ stan: 'stand1', recep: 'recep1' }).subscribe(response => {
     *   console.log(response.message); // Mensaje de éxito
     * });
     */
    addStanAndRecep(selection: selection): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.apiUrl}/addStanAndRecep`, selection, { headers });
    }

    /**
      * Recupera la información de la empresa desde el backend.
      * 
      * @function getCompany
      * @memberof CompanyService
      * @returns {Observable<any>} 
      * Un Observable que emite los datos de la empresa.
      * 
      * @example
      * companyService.getCompany().subscribe(companyData => {
      *   console.log(companyData.name); // Nombre de la empresa
      *   console.log(companyData.address); // Dirección de la empresa
      * });
      */
    getCompany(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.apiUrl}/getCompany`, { headers });
    }

    /**
     * Consulta al backend para verificar el estado de los formularios de la empresa.
     * 
     * @function getCompanyDataStatus
     * @memberof CompanyService
     * @returns {Observable<{ isStandComplete: boolean; isAdditionalInfoComplete: boolean }>} 
     * Un Observable que emite un objeto con dos propiedades:
     * - `isStandComplete`: Indica si el formulario del stand está completo.
     * - `isAdditionalInfoComplete`: Indica si la información adicional está completa.
     * 
     * @example
     * companyService.getCompanyDataStatus().subscribe(status => {
     *   console.log(status.isStandComplete); // true o false
     *   console.log(status.isAdditionalInfoComplete); // true o false
     * });
     */
    getCompanyDataStatus(): Observable<{ isStandComplete: boolean; isAdditionalInfoComplete: boolean }> {
        const headers = this.getHeaders();
        return this.http.get<{ isStandComplete: boolean; isAdditionalInfoComplete: boolean }>( 'https://backend-node-wpf9.onrender.com/company/status', { headers });
    }
}
