
import { Component, computed, signal, WritableSignal } from '@angular/core';
import { ImageService } from '../../services/imagen.service';
import { CarouselComponent, CarouselControlComponent, CarouselInnerComponent, CarouselItemComponent } from '@coreui/angular';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormComponent } from "./form/form.component";
import { StandDesingComponent } from "./stand-desing/stand-desing.component";
import { MatCardModule } from '@angular/material/card';

/**
 * CompanyDashboarComponent - Componente principal del panel de control de la empresa.
 * Proporciona una vista para seleccionar un stand virtual, subir documentos relevantes, y
 * gestionar la interacción visual a través de carruseles y formularios de diseño.
 */

@Component({
  selector: 'app-company-dashboar',
  standalone: true,
  imports: [
    CarouselComponent, MatCardModule, CarouselControlComponent, CarouselInnerComponent, CarouselItemComponent,
    RouterLink, CommonModule, FormComponent, StandDesingComponent
  ],
  templateUrl: './company-dashboar.component.html',
  styleUrl: './company-dashboar.component.scss'
})
export class CompanyDashboarComponent {
  
  /** Array de URLs de las imágenes de ejemplo para el carrusel */
  slides: string[] = [];

  /** Signal de selección de stand */
  standSelected: WritableSignal<boolean> = signal(false);

  /** Signal de selección de recepcionista */
  receptionistSelected: WritableSignal<boolean> = signal(false);

  /** Señal computada para determinar si se permite la subida de archivos */
  canUploadFiles = computed(() => this.standSelected() && this.receptionistSelected());

  /**
   * Constructor del componente, que inyecta el servicio de imágenes.
   * @param imageService Servicio para obtener imágenes de stand y recepcionista.
   */
  constructor(private imageService: ImageService) { }

  /**
   * Método de inicialización para cargar las imágenes en el carrusel.
   */
  ngOnInit(): void {
    this.imageService.getStands().subscribe(images => {
      this.slides = images;
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
