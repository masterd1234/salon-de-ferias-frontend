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
    './assets/recepcionist1.png',
    './assets/recepcionist2.png',
    './assets/recepcionist4.png',
    './assets/recepcionist3.png'
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
      './assets/recepcionist1.png',
      './assets/recepcionist2.png',
      './assets/recepcionist4.png',
      './assets/recepcionist3.png'
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