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
     * @method addStanAndRecep
     * @description Envía la selección de 'stan' y 'recep' al backend.
     * @param {selection} selection - Objeto con los datos de selección a añadir.
     * @returns {Observable<any>} Observable con la respuesta de la API.
     */
    addStanAndRecep(selection: selection): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.apiUrl}/addStanAndRecep`, selection, { headers });
    }

    /**
     * @method getCompany
     * @description Recupera la información de la empresa desde el backend.
     * @returns {Observable<any>} Observable con los datos de la empresa.
     */
    getCompany(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.apiUrl}/getCompany`, { headers });
    }
}
