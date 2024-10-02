import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Método para obtener usuarios
  getUsers(): Observable<any[]> {
    const token = this.authService.getToken();  // Obtenemos el token desde AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Adjuntamos el token JWT
      'Content-Type': 'application/json'
    });
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  // Método para crear un usuario nuevo
  createUser(user: { nombre: string; email: string; contraseña: string }, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Adjuntamos el token JWT
      'Content-Type': 'application/json'
    });
    return this.http.post(this.apiUrl, user, { headers }).pipe(
      tap(() => this.getUsers())
    );
  }
  // Eliminar un usuario por su ID
  deleteUser(id: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Adjuntar el token JWT
      'Content-Type': 'application/json'
    });
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  // Actualizar un usuario por su ID
  updateUser(id: string, updatedData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Adjuntar el token JWT
      'Content-Type': 'application/json'
    });
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatedData, { headers });
  }

  // Obtener un usuario por su ID
  getUserById(id: string): Observable<any> {
    const token = this.authService.getToken();  // Obtener el token desde AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Adjuntar el token JWT
      'Content-Type': 'application/json'
    });

    // Hacer la solicitud GET a la API con el ID del usuario
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

}
