import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * @class VideoService
 * @description Este servicio maneja la lógica para interactuar con la API de videos,
 * permitiendo agregar y recuperar URLs de videos, incluyendo autenticación con tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class VideoService {
  /**
   * @property {string} apiUrl - URL base de la API para la gestión de videos.
   * @private
   */
  private apiUrl = 'https://backend-node-wpf9.onrender.com/videos';

  /**
   * @constructor
   * @param {HttpClient} http - Servicio HttpClient para realizar peticiones HTTP.
   * @param {AuthService} authService - Servicio AuthService para obtener el token de autenticación.
   */
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * @private
   * @method getHeaders
   * @description Genera y retorna los encabezados de la petición HTTP con el token de autenticación incluido.
   * @returns {HttpHeaders} Encabezados con el token y tipo de contenido JSON.
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();  // Obtenemos el token desde AuthService
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * @method addVideo
   * @description Guarda una nueva URL de video en la API.
   * @param {string} url - La URL del video a guardar.
   * @returns {Observable<any>} Observable con la respuesta de la API.
   */
  addVideo(url: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(this.apiUrl, { url }, { headers });
  }

  /**
   * @method getVideos
   * @description Obtiene todas las URLs de videos almacenadas en la API.
   * @returns {Observable<any[]>} Observable con una lista de URLs de videos.
   */
  getVideos(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}
