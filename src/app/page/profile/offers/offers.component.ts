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

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatCardModule, CommonModule],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent {

  offerForm: FormGroup;

  constructor(private fb: FormBuilder, private offersService: OffersService, public dialogRef: MatDialogRef<OffersComponent>) {
    this.offerForm = this.fb.group({
      position: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      workplace_type: [''],
      job_type: ['']
    });
  }
  
    // Método para cerrar el diálogo y enviar la información de la oferta
    addOffer() {
      if (this.offerForm.valid) {
        this.dialogRef.close(this.offerForm.value); // Cierra el modal y envía los datos de la oferta
      }
    }
  
    onCancel(): void {
      this.dialogRef.close(); // Cierra el diálogo sin enviar datos
    }

}
