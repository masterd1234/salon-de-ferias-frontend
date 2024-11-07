import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  // Simulando un servicio que devuelve imágenes de stands y recepcionistas
  standImages = signal<string[]>([
    './assets/stand1.png',
    './assets/stand2.png',
    './assets/stand3.png',
    './assets/stand4.png',
    './assets/stand5.png',
    './assets/stand6.png',
    './assets/stand7.png',
    './assets/stand8.png'
  ]);

  receptionistImages = signal<string[]>([
    './assets/recepcionist1.png',
    './assets/recepcionist2.png',
    './assets/recepcionist4.png',
    './assets/recepcionist3.png'
  ]);

  getStands(): Observable<string[]> {
    const images = [
      './assets/stand1.png',
      './assets/stand2.png',
      './assets/stand3.png',
      './assets/stand4.png',
      './assets/stand5.png',
      './assets/stand6.png',
      './assets/stand7.png',
      './assets/stand8.png'
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