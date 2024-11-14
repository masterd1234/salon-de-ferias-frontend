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
    './assets/stand6.png',
    './assets/stand7.png',
    './assets/stand8.png',
    './assets/stand9.png',
    './assets/stand10.png'
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
      './assets/stand6.png',
      './assets/stand7.png',
      './assets/stand8.png',
      './assets/stand9.png',
      './assets/stand10.png'
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

  getStandConfig(stand: string): any {
    const configs: Record<string, any> = {
      './assets/stand1.png': {
        receptionistPosition: { x: 0.6, y: 0.355 }, // Ajusta según las proporciones relativas del círculo
        receptionistScale: 0.1, // Escala relativa
        receptionistOpacity: 1, // Opacidad
        logoPosition: {
          x: 0.3,
          y: 0.63,
          width: 0.4,
          height: 0.1
        },
        bannerPosition: {
          x: 0.35,
          y: 0.370,
          width: 0.308,
          height: 0.155,
        },

      },
      './assets/stand2.png': {
        receptionistPosition: { x: 0.6, y: 0.349 }, // Relativo al canvas
        receptionistScale: 0.1, // Tamaño relativo
        receptionistOpacity: 1,
        logoPosition: {
          x: 0.35,
          y: 0.63,
          width: 0.4,
          height: 0.1
        },
        bannerPosition: {
          x: 0.43,
          y: 0.302,
          width: 0.235,
          height: 0.235,
        }
      },
      './assets/stand3.png': {
        receptionistPosition: { x: 0.2, y: 0.378 }, // Relativo al canvas
        receptionistScale: 0.1, // Tamaño relativo
        receptionistOpacity: 1, // Opacidad
      },
      './assets/stand4.png': {
        receptionistPosition: { x: 0.650, y: 0.348 }, // Relativo al canvas
        receptionistScale: 0.1, // Tamaño relativo
        receptionistOpacity: 1, // Opacidad
      },
      './assets/stand6.png': {
        receptionistPosition: { x: 0.675, y: 0.372 }, // Relativo al canvas
        receptionistScale: 0.1, // Tamaño relativo
        receptionistOpacity: 1, // Opacidad
      },
      './assets/stand7.png': {
        receptionistPosition: { x: 0.55, y: 0.437 }, // Relativo al canvas
        receptionistScale: 0.1, // Tamaño relativo
        receptionistOpacity: 1, // Opacidad
      },
      './assets/stand8.png': {
        receptionistPosition: { x: 0.425, y: 0.372 }, // Relativo al canvas
        receptionistScale: 0.08, // Tamaño relativo
        receptionistOpacity: 1, // Opacidad
      },
      './assets/stand9.png': {
        receptionistPosition: { x: 0.425, y: 0.372 }, // Relativo al canvas
        receptionistScale: 0.08, // Tamaño relativo
        receptionistOpacity: 1, // Opacidad
      },
      './assets/stand10.png': {
        receptionistPosition: { x: 0.425, y: 0.372 }, // Relativo al canvas
        receptionistScale: 0.08, // Tamaño relativo
        receptionistOpacity: 1, // Opacidad
      }
      // Configuraciones adicionales
    };

    return configs[stand] || null;
  }


}