import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Offer } from '../../models/offers.model';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  private apiUrl = 'https://backend-node-wpf9.onrender.com/offers';

  constructor(private http: HttpClient, private authService: AuthService) { }
  // Helper para obtener headers con el token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();  // Obtenemos el token desde AuthService
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  addOffer(offer: Offer): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(this.apiUrl, offer, { headers });
  }

  getOffersById(id?: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/by-id`, { headers });
  }

}