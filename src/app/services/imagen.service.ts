import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  // Simulando un servicio que devuelve imágenes de stands y recepcionistas
  standImages = signal<string[]>([
    './assets/stand1.jpg',
    './assets/stand2.jpg',
    './assets/stand3.jpg',
    './assets/stand5.jpg',
    './assets/stand4.png'
  ]);

  receptionistImages = signal<string[]>([
    'assets/receptionist1.jpg',
    'assets/receptionist2.jpg',
    'assets/receptionist2.jpg',
    'assets/receptionist3.jpg'
  ]);

  getStands(): Observable<string[]> {
    const images = [
      './assets/stand1.jpg',
      './assets/stand2.jpg',
      './assets/stand3.jpg',
      './assets/stand5.jpg',
      './assets/stand4.png'
    ];
    return of(images);
  }

  getReceptionists(): Observable<string[]> {
    const images = [
      'assets/receptionist1.jpg',
      'assets/receptionist2.jpg',
      'assets/receptionist2.jpg',
      'assets/receptionist3.jpg'
    ];
    return of(images);
  }
  getStand() {
    return this.standImages();
  }
  getReceptionist() {
    return this.receptionistImages();
  }


}