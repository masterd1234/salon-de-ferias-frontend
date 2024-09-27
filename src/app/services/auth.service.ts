import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/login';  //backend
  private token: string | null = null;  // Almacenamos el token JWT aquí

  constructor(private http: HttpClient) {}

  // Método de login que envía las credenciales al backend
  login(username: string, password: string): Observable<any> {
    return this.http.post(this.apiUrl, { nombre: username, contraseña: password });
  }

  // Guardar el token JWT en el almacenamiento local
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token); 
  }

  // Obtener el token JWT almacenado
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  // Método para enviar solicitudes autenticadas
  getProtectedData(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', this.getToken() || '');
    return this.http.get('http://tu-backend.com/api/protected', { headers });
  }

  // Método para cerrar sesión
  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }
}
