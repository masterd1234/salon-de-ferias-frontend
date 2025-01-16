import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Offer } from '../../models/offers/offers.model';

import { environment } from '../../environments/environment';

/**
 * @class OffersService
 * @description Servicio para interactuar con la API de ofertas. Proporciona métodos para agregar,
 * obtener, actualizar, eliminar y buscar ofertas. Utiliza autenticación basada en cookies.
 */
@Injectable({
  providedIn: 'root',
})
export class OffersService {
  /**
   * URL base de la API para la gestión de ofertas.
   * @type {string}
   * @private
   */
  // private apiUrl = 'https://backend-node-wpf9.onrender.com/offers';
  private apiUrl = `${environment.url}/offers`;

  /**
   * Constructor del servicio OffersService.
   * @param {HttpClient} http - Servicio Angular para realizar peticiones HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * Maneja errores de la API y devuelve un Observable con un mensaje genérico.
   * @param {any} error - Objeto de error recibido de la API.
   * @param {string} defaultMessage - Mensaje predeterminado en caso de error.
   * @returns {Observable<{ success: boolean; message: string }>} Observable con el estado del éxito y el mensaje del error.
   * @private
   */
  private handleError(
    error: any,
    defaultMessage: string
  ): Observable<{ success: boolean; message: string }> {
    const errorMessage = error.error?.message || defaultMessage;
    return of({ success: false, message: errorMessage });
  }

  /**
   * Agrega una nueva oferta a la API.
   * @param {Offer} offer - Objeto con los datos de la oferta a agregar.
   * @param {string} [id] - ID opcional de la compañía asociada a la oferta.
   * @returns {Observable<{ success: boolean; message: string; id?: string }>} Observable con el estado del éxito, mensaje y el ID de la oferta creada.
   */
  addOffer(
    offer: Offer,
    id?: string
  ): Observable<{ success: boolean; message: string; id?: string }> {
    const url = id ? `${this.apiUrl}/add/${id}` : `${this.apiUrl}/add`;

    return this.http
      .post<{ message: string; id: string }>(url, offer, {
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          success: true,
          message: response.message,
          id: response.id,
        })),
        catchError((error) =>
          this.handleError(error, 'Error desconocido al agregar la oferta')
        )
      );
  }

  /**
   * Obtiene ofertas de la API, ya sea todas las de una compañía o una específica.
   * @param {string} [id] - ID opcional para filtrar las ofertas por compañía.
   * @returns {Observable<{ success: boolean; message: string; offers?: Offer[] }>} Observable con el estado del éxito, mensaje y la lista de ofertas.
   */
  getOffersById(
    id?: string
  ): Observable<{ success: boolean; message: string; offers?: Offer[] }> {
    const url = id ? `${this.apiUrl}/company/${id}` : `${this.apiUrl}/company`;

    return this.http
      .get<{ message: string; offers: Offer[] }>(url, { withCredentials: true })
      .pipe(
        map((response) => ({ success: true, ...response })),
        catchError((error) =>
          this.handleError(error, 'Error desconocido al obtener las ofertas')
        )
      );
  }

  /**
   * Elimina una oferta de la API según su ID.
   * @param {string} id - ID de la oferta a eliminar.
   * @returns {Observable<{ success: boolean; message: string }>} Observable con el estado del éxito y el mensaje de la operación.
   */
  deleteOffer(id: string): Observable<{ success: boolean; message: string }> {
    const url = `${this.apiUrl}/delete/${id}`;

    return this.http
      .delete<{ message: string }>(url, { withCredentials: true })
      .pipe(
        map((response) => ({ success: true, message: response.message })),
        catchError((error) =>
          this.handleError(error, 'Error desconocido al eliminar la oferta')
        )
      );
  }

  /**
   * Actualiza una oferta en la API según su ID.
   * @param {string} id - ID de la oferta a actualizar.
   * @param {Offer} offer - Objeto con los datos actualizados de la oferta.
   * @returns {Observable<{ success: boolean; message: string }>} Observable con el estado del éxito y el mensaje de la operación.
   */
  updateOffers(
    id: string,
    offer: Offer
  ): Observable<{ success: boolean; message: string }> {
    const url = `${this.apiUrl}/update/${id}`;

    return this.http
      .put<{ message: string }>(url, offer, { withCredentials: true })
      .pipe(
        map((response) => ({ success: true, message: response.message })),
        catchError((error) =>
          this.handleError(error, 'Error desconocido al actualizar la oferta')
        )
      );
  }

  /**
   * Obtiene todas las ofertas disponibles en la API.
   * @returns {Observable<{ success: boolean; message: string; offers?: Offer[] }>} Observable con el estado del éxito, mensaje y la lista de ofertas.
   */
  getAllOffers(): Observable<{
    success: boolean;
    message: string;
    offers?: Offer[];
  }> {
    const url = `${this.apiUrl}/all`;

    return this.http.get<Offer[]>(url, { withCredentials: true }).pipe(
      map((offers) => ({
        success: true,
        message: 'Ofertas obtenidas con éxito',
        offers,
      })),
      catchError((error) =>
        this.handleError(error, 'Error desconocido al recuperar las ofertas')
      )
    );
  }

  /**
   * Busca ofertas en la API según parámetros opcionales.
   * @param {Object} params - Parámetros opcionales para filtrar las ofertas.
   * @param {string} [params.keyword] - Palabra clave para buscar en el título o descripción.
   * @param {string} [params.location] - Ubicación de la oferta.
   * @param {string} [params.job_type] - Tipo de trabajo (e.g., "Full-time").
   * @param {string} [params.workplace_type] - Tipo de lugar de trabajo (e.g., "Remote").
   * @param {string} [params.company] - Nombre de la compañía.
   * @param {string} [params.sector] - Sector de la oferta.
   * @returns {Observable<{ success: boolean; message: string; offers?: Offer[] }>} Observable con el estado del éxito, mensaje y las ofertas encontradas.
   */
  searchOffers(params: {
    keyword?: string;
    location?: string;
    job_type?: string;
    workplace_type?: string;
    company?: string;
    sector?: string;
  }): Observable<{ success: boolean; message: string; offers?: Offer[] }> {
    const url = `${this.apiUrl}/search`;

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http
      .get<Offer[]>(url, { params: httpParams, withCredentials: true })
      .pipe(
        map((offers) => ({
          success: true,
          message: 'Ofertas obtenidas con éxito',
          offers,
        })),
        catchError((error) =>
          this.handleError(error, 'Error desconocido al buscar ofertas')
        )
      );
  }
}
