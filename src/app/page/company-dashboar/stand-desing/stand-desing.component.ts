import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImageService } from '../../../services/imagen.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';

@Component({
  templateUrl: './stand-desing.component.html',
  styleUrls: ['./stand-desing.component.css'],
  selector: 'app-desing-root',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandDesingComponent implements OnInit {
  // Signals para almacenar las imágenes y la selección actual
  standImages = signal<string[]>([]);
  receptionistImages = signal<string[]>([]);
  selectedStand = signal<string | null>(null);
  selectedReceptionist = signal<string | null>(null);

  // Otros campos para manejar el estado de la aplicación
  nombre: string | null = '';
  descripcion: string | null = '';
  imagenCargada: boolean = false;
  imagenSubiendo: boolean = false;
  imageSrc: string | null = null;
  customStandEnabled: boolean = false;  // Para habilitar la subida de stand personalizado

  constructor(private imageService: ImageService, private cdr: ChangeDetectorRef, private companyService: CompanyService) {
    this.standImages.set(this.imageService.getStand());
    this.receptionistImages.set(this.imageService.getReceptionist());
  }

  ngOnInit(): void { }

  // Función para activar/desactivar la opción de subir stand personalizado
  toggleCustomStand(event: any): void {
    this.customStandEnabled = event.target.checked;
  }

  // Método para abrir el diálogo de selección de archivo para el stand personalizado
  uploadCustomStand(): void {
    const fileInput = document.getElementById('standUpload') as HTMLInputElement;
    fileInput.click();
  }

  // Manejo de la subida del stand personalizado
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

  // Método para seleccionar una imagen de stand o recepcionista
  selectImage(image: string, type: 'stand' | 'receptionist') {
    if (type === 'stand') {
      this.selectedStand.set(image);
    } else {
      this.selectedReceptionist.set(image);
    }
  }

  // Verificar si una imagen está seleccionada
  isSelected(image: string, selectedImage: string | null): boolean {
    return image === selectedImage;
  }

  // Método para manejar el scroll de los carruseles
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
  
    const selection = {
      URLStand,
      URLRecep
    };
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

  // Método para limpiar la selección de stands y recepcionistas
  clearSelection() {
    this.selectedStand.set(null);
    this.selectedReceptionist.set(null);
    this.imageSrc = null;
    this.imagenCargada = false;
    this.cdr.detectChanges();  // Forzar la actualización de la vista
  }



}
