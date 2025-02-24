import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private apiUrl = `${environment.url}/file`;

  constructor(private http: HttpClient) {}

  private handleError(
    error: any,
    defaultMessage: string
  ): Observable<{ success: boolean; message: string }> {
    const errorMessage = error.error?.message || defaultMessage;
    return of({ success: false, message: errorMessage });
  }

  getFilesById(id?: string): Observable<any> {
    const url = id ? `${this.apiUrl}/company/${id}` : `${this.apiUrl}/company`;

    return this.http.get<any>(url, { withCredentials: true }).pipe(
      map((response) => ({ success: true, ...response })),
      catchError((error) =>
        this.handleError(error, 'Error desconocido al obtener las ofertas')
      )
    );
  }

  addFilesById(formData: FormData, id?: string): Observable<any> {
    const url = id ? `${this.apiUrl}/company/${id}` : `${this.apiUrl}/company`;

    return this.http.post<any>(url, formData, { withCredentials: true }).pipe(
      map((response) => ({ success: true, ...response })),
      catchError((error) =>
        this.handleError(error, 'Error al cargar el archivo')
      )
    );
  }
}
