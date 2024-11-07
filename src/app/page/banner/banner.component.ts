import { CommonModule } from '@angular/common';
import { Component, Input, Signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-banner-root',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
  standalone: true,
  imports: [CommonModule, MatDividerModule, ReactiveFormsModule, MatCardModule, MatSliderModule, MatFormFieldModule, FormsModule]
})

export class BannerComponent {
  @Input() canUploadFiles: boolean = false;
  formBanner!: FormGroup;
  bannerUrl: string | null = null;
  posterUrl: string | null = null;
  logoUrl: string | null = null;
  logoTransform: string = 'scale(1)';
  zoom: number = 1;
  logoPosition = { x: 0, y: 0 };
  // Variable para controlar la visibilidad del contenido
  isContentVisible: boolean = false;

  toggleContentVisibility() {
    this.isContentVisible = !this.isContentVisible;
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.formBanner = this.fb.group({
      logo: ['', Validators.required]
    });
  }

  onFileChange(event: Event, type: string) {
    if ((type === 'banner' || type === 'poster') && !this.canUploadFiles) {
      alert("Debe seleccionar un stand y un recepcionista antes de subir un banner o póster.");
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert("Por favor sube solo archivos de imagen.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'banner') this.bannerUrl = result;
        if (type === 'poster') this.posterUrl = result;
        if (type === 'logo') this.logoUrl = result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.formBanner.valid) {
      console.log("Formulario enviado:", this.formBanner.value);
      this.formBanner.reset();
      this.bannerUrl = null;
      this.posterUrl = null;
      this.logoUrl = null;
    }
  }

  // Métodos para el ajuste de zoom y arrastre del logo
  onZoom(event: WheelEvent) {
    event.preventDefault();
    const zoomFactor = 0.05; // Ajusta la sensibilidad del zoom
    this.zoom += event.deltaY > 0 ? -zoomFactor : zoomFactor;
    this.zoom = Math.min(Math.max(0.5, this.zoom), 2);
    this.logoTransform = `scale(${this.zoom})`;
  }

  // Métodos de arrastre con mouse
  startDragging(event: MouseEvent) {
    const initialX = event.clientX - this.logoPosition.x;
    const initialY = event.clientY - this.logoPosition.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      this.logoPosition.x = moveEvent.clientX - initialX;
      this.logoPosition.y = moveEvent.clientY - initialY;
      this.logoTransform = `translate(${this.logoPosition.x}px, ${this.logoPosition.y}px) scale(${this.zoom})`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

}