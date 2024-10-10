import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Usuario } from '../../models/users.model';
 
@Injectable({
  providedIn: 'root'
})
export class UserService {

  
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Helper para obtener headers con el token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();  // Obtenemos el token desde AuthService
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Método para obtener usuarios
  getUsers(): Observable<Usuario[]> {
    const headers = this.getHeaders();
    return this.http.get<Usuario[]>(this.apiUrl, { headers }).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios', error);
        return of([]);  // Retorna un array vacío en caso de error
      })
    );
  }

  // Método para crear un usuario nuevo
  createUser(user: Usuario): Observable<Usuario | null> {
    const headers = this.getHeaders();
    return this.http.post<Usuario>(this.apiUrl, user, { headers }).pipe(
      tap(() => this.getUsers()),  // Actualizamos la lista después de crear
      catchError(error => {
        console.error('Error al crear usuario', error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }

  // Eliminar un usuario por su ID
  deleteUser(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(error => {
        console.error(`Error al eliminar usuario con ID: ${id}`, error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }

  // Actualizar un usuario por su ID
  updateUser(id: string, updatedData: Partial<Usuario>): Observable<Usuario | null> {
    const headers = this.getHeaders();
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, updatedData, { headers }).pipe(
      catchError(error => {
        console.error(`Error al actualizar usuario con ID: ${id}`, error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }

  // Obtener un usuario por su ID
  getUserById(id: string): Observable<Usuario | null> {
    const headers = this.getHeaders();
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(error => {
        console.error(`Error al obtener usuario con ID: ${id}`, error);
        return of(null);  // Retorna null en caso de error
      })
    );
  }

}