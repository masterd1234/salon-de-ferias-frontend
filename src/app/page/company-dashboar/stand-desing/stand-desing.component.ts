/**
 * StandDesingComponent - Este componente permite a los usuarios seleccionar y personalizar el diseño de un stand
 * en una feria virtual, incluyendo la selección de una imagen de stand y un recepcionista.
 * Incluye funcionalidades para la carga de imágenes personalizadas y la vista previa en tiempo real.
 */
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImageService } from '../../../services/imagen.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { BannerComponent } from "../../banner/banner.component";

@Component({
  templateUrl: './stand-desing.component.html',
  styleUrls: ['./stand-desing.component.scss'],
  selector: 'app-desing-root',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, CommonModule, ReactiveFormsModule, BannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandDesingComponent implements OnInit {
  /** Signal para almacenar imágenes de los stands disponibles */
  standImages = signal<string[]>([]);
  /** Signal para almacenar imágenes de los recepcionistas disponibles */
  receptionistImages = signal<string[]>([]);
  /** Imagen de stand seleccionada actualmente */
  selectedStand = signal<string | null>(null);
  /** Imagen de recepcionista seleccionada actualmente */
  selectedReceptionist = signal<string | null>(null);

  /** Señal computada que indica si se pueden subir archivos, en función de la selección de stand y recepcionista */
  canUploadFiles = computed(() => !!this.selectedStand() && !!this.selectedReceptionist());

  /** Nombre de la empresa (opcional) */
  nombre: string | null = '';
  /** Descripción de la empresa (opcional) */
  descripcion: string | null = '';
  /** Bandera para verificar si se ha cargado una imagen de logo */
  imagenCargada: boolean = false;
  /** Bandera para indicar el estado de subida de la imagen */
  imagenSubiendo: boolean = false;
  /** URL del logo subido */
  imageSrc: string | null = null;
  /** Habilitar la opción para subir un stand personalizado */
  customStandEnabled: boolean = false;

  /**
   * Constructor de StandDesingComponent - Inicializa los servicios de imagen y empresa, y carga imágenes de stand y recepcionista.
   * @param imageService Servicio para obtener las imágenes de stand y recepcionista.
   * @param cdr ChangeDetectorRef para forzar la detección de cambios.
   * @param companyService Servicio para enviar la selección de stand y recepcionista al backend.
   */
  constructor(private imageService: ImageService, private cdr: ChangeDetectorRef, private companyService: CompanyService) {
    this.standImages.set(this.imageService.getStand());
    this.receptionistImages.set(this.imageService.getReceptionist());
  }

  /** Método del ciclo de vida OnInit */
  ngOnInit(): void {}

  /**
   * Activa o desactiva la opción de subir un stand personalizado.
   * @param event Evento de cambio del checkbox.
   */
  toggleCustomStand(event: any): void {
    this.customStandEnabled = event.target.checked;
  }

  /**
   * Abre el diálogo de selección de archivo para subir un stand personalizado.
   */
  uploadCustomStand(): void {
    const fileInput = document.getElementById('standUpload') as HTMLInputElement;
    fileInput.click();
  }

  /**
   * Maneja la subida del stand personalizado, verificando tipo de archivo y tamaño.
   * @param event Evento de cambio del archivo.
   */
  handleStandUpload(event: any): void {
    const archivo = event?.target?.files?.[0];
    if (archivo && archivo.type === 'image/jpeg' && archivo.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const nuevoStand = e.target.result;
        this.standImages.set([nuevoStand, ...this.standImages()]);  // Agregar el nuevo stand al principio
        this.selectedStand.set(nuevoStand);  // Seleccionar automáticamente el nuevo stand
        this.cdr.detectChanges();  // Forzar la actualización de la vista
      };
      reader.readAsDataURL(archivo);
    } else {
      alert('Solo se permiten imágenes en formato .jpg con un tamaño máximo de 5Mb');
    }
  }

  /**
   * Selecciona una imagen de stand o recepcionista.
   * @param image URL de la imagen seleccionada.
   * @param type Tipo de imagen seleccionada: 'stand' o 'receptionist'.
   */
  selectImage(image: string, type: 'stand' | 'receptionist') {
    if (type === 'stand') {
      this.selectedStand.set(image);
    } else {
      this.selectedReceptionist.set(image);
    }
  }

  /**
   * Verifica si una imagen está seleccionada.
   * @param image Imagen a verificar.
   * @param selectedImage Imagen seleccionada actual.
   * @returns boolean - true si la imagen está seleccionada, de lo contrario false.
   */
  isSelected(image: string, selectedImage: string | null): boolean {
    return image === selectedImage;
  }

  /**
   * Maneja el desplazamiento del carrusel de imágenes.
   * @param type Tipo de carrusel: 'stand' o 'receptionist'.
   * @param direction Dirección del desplazamiento: 'left' o 'right'.
   */
  scroll(type: 'stand' | 'receptionist', direction: 'left' | 'right') {
    const container = document.querySelector(
      type === 'stand' ? '.stand-carousel' : '.receptionist-carousel'
    ) as HTMLElement;

    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Envía la selección actual de stand y recepcionista al backend.
   */
  submitSelection() {
    let URLStand = this.selectedStand();
    let URLRecep = this.selectedReceptionist();
  
    // Verificar si son null, y asignar un valor predeterminado
    if (URLStand === null || URLStand === '') {
      alert('Debes seleccionar un Stand.');
      return;
    }
    if (URLRecep === null || URLRecep === '') {
      alert('Debes seleccionar un Recepcionista.');
      return;
    }
  
    const selection = { URLStand, URLRecep };
    // Llama al servicio para enviar los datos al backend
    this.companyService.addStanAndRecep(selection).subscribe(
      (response) => {
        console.log('Datos enviados exitosamente:', response);
        alert('Selección enviada correctamente');
      },
      (error) => {
        console.error('Error al enviar la selección:', error);
        alert('Hubo un error al enviar la selección');
      }
    );
  }

  /**
   * Limpia la selección actual de stands y recepcionistas.
   */
  clearSelection() {
    this.selectedStand.set(null);
    this.selectedReceptionist.set(null);
    this.imageSrc = null;
    this.imagenCargada = false;
    this.cdr.detectChanges();  // Forzar la actualización de la vista
  }
}
