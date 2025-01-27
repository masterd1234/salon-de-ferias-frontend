import { Component, computed, signal, WritableSignal } from '@angular/core';
import { ImageService } from '../../services/design.service';
import {
  CarouselComponent,
  CarouselControlComponent,
  CarouselInnerComponent,
  CarouselItemComponent,
} from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { FormComponent } from './form/form.component';
import { StandDesingComponent } from './stand-desing/stand-desing.component';
import { MatCardModule } from '@angular/material/card';
import { CompanyService } from '../../services/information.service';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';
/**
 * CompanyDashboarComponent - Componente principal del panel de control de la empresa.
 * Proporciona una vista para seleccionar un stand virtual, subir documentos relevantes, y
 * gestionar la interacción visual a través de carruseles y formularios de diseño.
 */

@Component({
  selector: 'app-company-dashboar',
  standalone: true,
  imports: [
    CarouselComponent,
    MatCardModule,
    CarouselControlComponent,
    CarouselInnerComponent,
    CarouselItemComponent,
    CommonModule,
    FormComponent,
    StandDesingComponent,
  ],
  templateUrl: './company-dashboar.component.html',
  styleUrl: './company-dashboar.component.scss',
})
export class CompanyDashboarComponent {
  private apiUrl = `${environment.url}`;
  /** Array de URLs de las imágenes de ejemplo para el carrusel */
  slides: { url: string }[] = [];

  /** Signal de selección de stand */
  standSelected: WritableSignal<boolean> = signal(false);

  /** Signal de selección de recepcionista */
  receptionistSelected: WritableSignal<boolean> = signal(false);

  /** Señal computada para determinar si se permite la subida de archivos */
  canUploadFiles = computed(
    () => this.standSelected() && this.receptionistSelected()
  );

  /**
   * Constructor del componente, que inyecta el servicio de imágenes.
   * @param imageService Servicio para obtener imágenes de stand y recepcionista.
   */
  constructor(
    private imageService: ImageService,
    private sanitizer: DomSanitizer
  ) {}

  /**
   * Método de inicialización para cargar las imágenes en el carrusel.
   */
  ngOnInit(): void {
    this.imageService.getAllStands().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Reemplazar las URLs con el proxy
          this.slides = response.data.map((file: any) => ({
            // url: `https://backend-node-wpf9.onrender.com/proxy?url=${file.url.fileUrl}`, // Usar el proxy
            url: `${this.apiUrl}/proxy?url=${file.url.fileUrl}`,
          }));
        } else {
          console.error('Error al obtener los stands:', response.message);
        }
      },
      error: (err) => {
        console.error('Error inesperado al cargar los stands:', err);
      },
    });
  }

  /**
   * Establece el estado de selección del stand.
   * @param selected - Booleano que indica si el stand está seleccionado.
   */
  setStandSelected(selected: boolean) {
    this.standSelected.set(selected);
  }

  /**
   * Establece el estado de selección del recepcionista.
   * @param selected - Booleano que indica si el recepcionista está seleccionado.
   */
  setReceptionistSelected(selected: boolean) {
    this.receptionistSelected.set(selected);
  }
}
