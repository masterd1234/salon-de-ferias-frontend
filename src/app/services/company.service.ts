import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Company, selection } from '../../models/company.model';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {

    private apiUrl = 'https://backend-node-wpf9.onrender.com/company';  // URL de tu backend

    constructor(private http: HttpClient, private authService: AuthService) { }

    // Helper para obtener headers con el token
    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();  // Obtenemos el token desde AuthService
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
    // Método para añadir una empresa
    addCompany(companyData: Company): Observable<any> {
        // Realizar la petición POST al backend para crear la empresa
        const headers = this.getHeaders();
        return this.http.post(this.apiUrl, companyData, { headers });
    }

    addStanAndRecep(selection: selection): Observable<any>{
        const headers = this.getHeaders();
        return this.http.post(this.apiUrl + '/addStanAndRecep', selection, { headers });
    }

    getCompany (): Observable<any>{
        const headers = this.getHeaders();
        return this.http.get(this.apiUrl + '/getCompany', { headers });
    }
}