import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Offer } from '../../models/offers.model';

/**
 * @class OffersService
 * @description Este servicio maneja la lógica para interactuar con la API de ofertas, permitiendo agregar, 
 * obtener y eliminar ofertas. Utiliza autenticación basada en tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class OffersService {
  /**
   * @property {string} apiUrl - URL base de la API para la gestión de ofertas.
   * @private
   */
  private apiUrl = 'https://backend-node-wpf9.onrender.com/offers';

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
    const token = this.authService.getToken();  // Obtiene el token desde AuthService
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * @method addOffer
   * @description Envía una nueva oferta a la API para su almacenamiento.
   * @param {Offer} offer - La oferta a añadir.
   * @returns {Observable<any>} Observable con la respuesta de la API.
   */
  addOffer(offer: Offer): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(this.apiUrl, offer, { headers });
  }

  /**
   * @method getOffersById
   * @description Recupera las ofertas de la API, filtradas opcionalmente por ID.
   * @param {string} [id] - ID opcional para filtrar una oferta específica.
   * @returns {Observable<any>} Observable con la oferta o la lista de ofertas.
   */
  getOffersById(id?: string): Observable<any> {
    const headers = this.getHeaders();
    const url = id ? `${this.apiUrl}/by-id/${id}` : `${this.apiUrl}/by-id`;
    return this.http.get(url, { headers });
  }

  /**
   * @method deleterOffer
   * @description Elimina una oferta de la API según su ID.
   * @param {string} id - El ID de la oferta a eliminar.
   * @returns {Observable<any>} Observable con la respuesta de la API.
   */
  deleterOffer(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}
