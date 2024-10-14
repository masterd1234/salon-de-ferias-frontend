import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImageService } from '../../../services/imagen.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
 logo: File | null = null;
 imagenCargada: boolean = false;
 imagenSubiendo: boolean = false;
 imageSrc: string | null = null;
 customStandEnabled: boolean = false;  // Para habilitar la subida de stand personalizado

 constructor(private imageService: ImageService, private cdr: ChangeDetectorRef) {
   this.standImages.set(this.imageService.getStand());
   this.receptionistImages.set(this.imageService.getReceptionist());
 }

 ngOnInit(): void {}

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
 
 // Método para subir el logo
 selectLogo(): void {
   const fileInput = document.getElementById('logo') as HTMLInputElement;
   fileInput.click();  // Simular el clic para abrir el input de archivo
 }

 subirLogo(event: any): void {
   const archivo = event?.target?.files?.[0];
   if (archivo && archivo.type === 'image/jpeg' && archivo.size <= 5 * 1024 * 1024) {
     const reader = new FileReader();
     reader.onload = (e: any) => {
       this.imageSrc = e.target.result;
       this.imagenCargada = true;
       this.cdr.detectChanges();  // Forzar la actualización de la vista
       alert('Logo subido correctamente');
     };
     reader.readAsDataURL(archivo);
   } else {
     alert('Solo se permiten imágenes en formato .jpg con un tamaño máximo de 5Mb');
   }
 }

 // Método para borrar el logo subido
 borrarLogo(): void {
   this.imageSrc = null;
   this.imagenCargada = false;
 }

 // Método para editar el logo (borrar el actual y subir uno nuevo)
 editarLogo(): void {
   this.borrarLogo();
   this.selectLogo();
 }

 // Método para enviar la selección de imágenes y logo
 submitSelection() {
   const selection = {
     stand: this.selectedStand(),
     receptionist: this.selectedReceptionist(),
     logo: this.imageSrc  // Incluir el logo en la selección
   };
   console.log('Selección enviada:', selection);
   alert(`Has seleccionado:\nStand: ${selection.stand}\nRecepcionista: ${selection.receptionist}\nLogo: ${selection.logo ? 'Subido' : 'No subido'}`);
 }

 // Método para limpiar la selección de stands y recepcionistas
 clearSelection() {
   this.selectedStand.set(null);
   this.selectedReceptionist.set(null);
   this.logo = null;
   this.imageSrc = null;
   this.imagenCargada = false;
   this.cdr.detectChanges();  // Forzar la actualización de la vista
 }



}
