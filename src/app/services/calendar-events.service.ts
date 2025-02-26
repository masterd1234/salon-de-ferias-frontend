import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { event } from 'jquery';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventsService {
  private apiUrl = `${environment.url}/information`;

  constructor(private http: HttpClient) {}

  private handleError(
    error: any,
    defaultMessage: string
  ): Observable<{ success: boolean; message: string }> {
    const errorMessage = error.error?.message || defaultMessage;
    return of({ success: false, message: errorMessage });
  }

  getCalendarEventsById(id?: string): Observable<any> {
    const url = id
      ? `${this.apiUrl}/get-links-calendar/${id}`
      : `${this.apiUrl}/get-links-calendar`;

    return this.http.get<any>(url, { withCredentials: true }).pipe(
      map((response) => ({ success: true, ...response })),
      catchError((error) =>
        this.handleError(error, 'Error desconocido al obtener los eventos')
      )
    );
  }

  addEvent(companyID: string, eventData: any): Observable<any> {
    // return this.http.post(
    //   `${this.apiUrl}/add-link-calendar/${companyID}`,
    //   { withCredentials: true },
    //   eventData
    // );
    const url = companyID
      ? `${this.apiUrl}/add-link-calendar/${companyID}`
      : `${this.apiUrl}/add-link-calendar`;
    return this.http
      .post<{ message: string; events: [] }>(url, eventData, {
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          success: true,
          message: response.message,
          event: response.events,
        })),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Error desconocido al agregar el evento';
          return of({ success: false, message: errorMessage });
        })
      );
  }
}
