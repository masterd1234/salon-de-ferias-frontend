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
  form: FormGroup;
  stands: string[] = [];
  receptionists: string[] = [];
  imagenCargada: boolean = false;
  imageSrc: string | ArrayBuffer | null = '';

  constructor(
    private fb: FormBuilder,
    private imageService: ImageService,

  ) {
    this.form = this.fb.group({
      selectedStand: [''],
      selectedReceptionist: [''],
      companyLogo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarStands();
    this.cargarReceptionists();
  }

  // Cargar stands desde el servicio
  cargarStands() {
    this.imageService.getStands().subscribe((stands: string[]) => {
      this.stands = stands;
    });
  }

  // Cargar recepcionistas desde el servicio
  cargarReceptionists() {
    this.imageService.getReceptionists().subscribe((receptionists: string[]) => {
      this.receptionists = receptionists;
    });
  }

  // Manejo de selección de stand
  selectImage(image: string, type: 'stand' | 'receptionist') {
    if (type === 'stand') {
      this.form.controls['selectedStand'].setValue(image);
    } else {
      this.form.controls['selectedReceptionist'].setValue(image);
    }
  }

  // Manejo de subir logo
  subirLogo(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) { // Verificamos que no sea undefined
          this.imageSrc = result;  // Garantizamos que sea string | ArrayBuffer | null
          this.form.controls['companyLogo'].setValue(this.imageSrc);
          this.imagenCargada = true;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  borrarLogo() {
    this.form.controls['companyLogo'].setValue('');
    this.imagenCargada = false;
    this.imageSrc = null;
  }

  // Enviar la selección final del formulario
  submitSelection() {
    if (this.form.valid) {
      console.log('Formulario enviado:', this.form.value);
    }
  }

  scroll(type: 'stand' | 'receptionist', direction: 'left' | 'right') {
    const container = type === 'stand' 
      ? document.querySelector('.stand-carousel') 
      : document.querySelector('.receptionist-carousel');
  
    if (container) {
      const scrollAmount = 300; // Cantidad de desplazamiento en píxeles
      const currentScroll = container.scrollLeft;
  
      if (direction === 'left') {
        container.scrollTo({ left: currentScroll - scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollTo({ left: currentScroll + scrollAmount, behavior: 'smooth' });
      }
    }
  }

  // Limpiar la selección
  clearSelection() {
    this.form.reset();
    this.imagenCargada = false;
    this.imageSrc = null;
  }

  // Métodos auxiliares para verificar selecciones
  isSelected(image: string, selected: string) {
    return image === selected;
  }

  // Obtener los stands y recepcionistas seleccionados
  selectedStand() {
    return this.form.controls['selectedStand'].value;
  }

  selectedReceptionist() {
    return this.form.controls['selectedReceptionist'].value;
  }


}
