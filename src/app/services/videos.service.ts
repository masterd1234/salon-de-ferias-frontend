import { Injectable } from '@angular/core';
import { HttpClient,  HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'https://backend-node-wpf9.onrender.com/videos';

  constructor(private http: HttpClient, private authService: AuthService) {}
    // Helper para obtener headers con el token
    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();  // Obtenemos el token desde AuthService
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
  // Guardar una nueva URL de video
  addVideo(url: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(this.apiUrl, { url }, {headers});
  }

  // Obtener todas las URLs de videos
  getVideos(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.apiUrl, {headers});
  }
}