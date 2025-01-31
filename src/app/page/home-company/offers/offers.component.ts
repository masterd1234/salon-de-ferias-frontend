import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OffersService } from '../../../services/offers.service';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { provinciasEspana } from '../../../../models/offers/provincias.model';
import { JobTypeMap } from '../../../../models/offers/jobType.model';
import { sectorsMap } from '../../../../models/offers/sector.model';
import { MatGridListModule } from '@angular/material/grid-list';

/**
 * OffersComponent
 * 
 * Este componente presenta un formulario para añadir una nueva oferta de trabajo.
 * Permite a los usuarios completar detalles de la oferta, como la posición, ubicación,
 * tipo de trabajo, lugar de trabajo y descripción.
 * 
 * Funcionalidades principales:
 * - Validación de campos obligatorios en el formulario.
 * - Envío de datos de la oferta mediante un diálogo de Angular Material.
 * - Responsive: Adaptación del diseño en dispositivos móviles.
 */

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [ReactiveFormsModule, MatGridListModule, MatInputModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatCardModule, CommonModule],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent {

  // Formulario reactivo para crear una nueva oferta de trabajo
  offerForm: FormGroup;
  location = provinciasEspana;

  JobTypeMap = JobTypeMap;
  jobTypeKeys = Object.keys(JobTypeMap);

  sectorName = sectorsMap;
  sectorKeys = Object.keys(sectorsMap);

  constructor(
    private fb: FormBuilder,
    private offersService: OffersService,
    public dialogRef: MatDialogRef<OffersComponent>
  ) {
    this.offerForm = this.fb.group({
      position: ['', Validators.required],      // Campo obligatorio para la posición
      location: ['', Validators.required],      // Campo obligatorio para la ubicación
      description: ['', Validators.required],   // Campo obligatorio para la descripción
      sector: ['', Validators.required],        // Campo obligatorio para el sector
      workplace_type: [''],                     // Campo opcional para el tipo de lugar de trabajo
      job_type: [''],                            // Campo opcional para el tipo de trabajo
      link: ['', Validators.required]
    });
  }


  /**
   * Método para añadir la oferta de trabajo.
   * Si el formulario es válido, cierra el diálogo y envía los datos de la oferta.
   */
  addOffer() {
    if (this.offerForm.valid) {
      // Obtener el valor del formulario
      let formData = this.offerForm.value;
  
      // Transformar la primera letra de "location" a mayúscula
      if (formData.location) {
        formData.location = formData.location.charAt(0).toUpperCase() + formData.location.slice(1).toLowerCase();
      }
  
      // Cerrar el diálogo y enviar los datos formateados
      this.dialogRef.close(formData);
    }
  }

  /**
   * Método para cancelar la operación.
   * Cierra el diálogo sin enviar datos.
   */
  onCancel(): void {
    this.dialogRef.close();
  }

}