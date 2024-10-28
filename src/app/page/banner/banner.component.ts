import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-banner-root',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})

export class BannerComponent {
  formBanner: FormGroup;

  // Variables para las imágenes
  bannerUrl: string | ArrayBuffer | null = null;
  posterUrl: string | ArrayBuffer | null = null;
  logoUrl: string | ArrayBuffer | null = null;

  // Variables para el logo (zoom y arrastre)
  logoScale: number = 1;
  logoTranslateX: number = 0;
  logoTranslateY: number = 0;
  logoTransform: string = `scale(${this.logoScale}) translate(${this.logoTranslateX}px, ${this.logoTranslateY}px)`; 

  // Variables para el arrastre del logo
  isDragging: boolean = false;
  lastX: number = 0;
  lastY: number = 0;

  @ViewChild('logoViewport') logoViewport!: ElementRef;

  constructor(private fb: FormBuilder) {
    this.formBanner = this.fb.group({
      stand: ['', Validators.required],
      receptionist: ['', Validators.required],
      bannerLink: [''],
      posterLink: [''],
      logo: [null, Validators.required]
    });

    // Definimos estas funciones como propiedades de clase para evitar múltiples `bind`
    this.onDrag = this.onDrag.bind(this);
    this.stopDragging = this.stopDragging.bind(this);
  }

  // Mostrar campos de Banner y Póster
  showBannerAndPoster(): boolean {
    return this.formBanner.get('stand')?.value && this.formBanner.get('receptionist')?.value;
  }

  // Manejador de archivos para banner, póster y logo
  onFileChange(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'banner') {
          this.bannerUrl = reader.result;
        } else if (type === 'poster') {
          this.posterUrl = reader.result;
        } else if (type === 'logo') {
          this.logoUrl = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Zoom para el logo
  onZoom(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.logoScale = Math.min(Math.max(0.5, this.logoScale + delta), 2);  // Limita el zoom entre 0.5x y 2x
    this.updateLogoTransform();
  }

  // Iniciar el arrastre del logo
  startDragging(event: MouseEvent): void {
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    // Agregar eventos
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.stopDragging);
  }

  // Arrastre del logo
  onDrag(event: MouseEvent): void {
    if (this.isDragging) {
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.logoTranslateX += dx;
      this.logoTranslateY += dy;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.updateLogoTransform();
    }
  }

  // Detener el arrastre del logo
  stopDragging(): void {
    this.isDragging = false;
    
    // Eliminar eventos
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDragging);
  }

  // Actualizar la transformación del logo
  updateLogoTransform(): void {
    this.logoTransform = `translate(${this.logoTranslateX}px, ${this.logoTranslateY}px) scale(${this.logoScale})`;
  }

  onSubmit(): void {
    if (this.formBanner.valid) {
      console.log('Formulario válido y enviado:', this.formBanner.value);
    } else {
      console.log('Formulario no válido');
      console.log('Errores en el formulario:', this.formBanner.controls);
      this.formBanner.markAllAsTouched();  // Marcar todos los campos como tocados para mostrar los errores
    }
  }
}
