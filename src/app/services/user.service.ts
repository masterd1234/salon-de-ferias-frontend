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
      tap(()=> this.getUsers())
    );
  }
}
