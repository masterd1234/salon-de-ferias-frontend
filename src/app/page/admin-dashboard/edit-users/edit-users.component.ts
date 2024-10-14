import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/admin.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-edit-users',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatSelectModule,
    MatOptionModule],
  templateUrl: './edit-users.component.html',
  styleUrl: './edit-users.component.css'
})
export class EditUsersComponent {

  editUserForm: FormGroup;
  userId: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditUsersComponent>);
  private userService = inject(UserService);
  private dialogData = inject(MAT_DIALOG_DATA);

  constructor() {
    this.userId = this.dialogData.userId; // Obtiene el ID del usuario pasado al modal
    this.editUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      // Campos adicionales para COs
      company: [''],
      standId: [''],
      cif: [''],

      // Campos adicionales para Visitantes
      dni: [''],
      studies: ['']
    });

    // Escuchar cambios en el campo "rol" para actualizar las validaciones
    this.editUserForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.updateValidationsBasedOnRole(rol);
    });
  }

  // Función para actualizar validaciones dinámicas basadas en el rol seleccionado
  updateValidationsBasedOnRole(rol: string) {
    const companyControl = this.editUserForm.get('company');
    const standIdControl = this.editUserForm.get('standId');
    const cifControl = this.editUserForm.get('cif');
    const dniControl = this.editUserForm.get('dni');
    const studiesControl = this.editUserForm.get('studies');

    // Resetear las validaciones
    companyControl?.clearValidators();
    standIdControl?.clearValidators();
    cifControl?.clearValidators();
    dniControl?.clearValidators();
    studiesControl?.clearValidators();

    if (rol === 'co') {
      // Si el rol es CO, activamos las validaciones de empresa, standId y cif
      companyControl?.setValidators([Validators.required]);
      standIdControl?.setValidators([Validators.required]);
      cifControl?.setValidators([Validators.required]);
    } else if (rol === 'visitante') {
      // Si el rol es visitante, activamos las validaciones de dni y estudios
      dniControl?.setValidators([Validators.required]);
      studiesControl?.setValidators([Validators.required]);
    }

    // Aseguramos que se actualicen los estados de los controles
    companyControl?.updateValueAndValidity();
    standIdControl?.updateValueAndValidity();
    cifControl?.updateValueAndValidity();
    dniControl?.updateValueAndValidity();
    studiesControl?.updateValueAndValidity();
  }


  ngOnInit(): void {
    // Cargar los datos del usuario
    this.userService.getUserById(this.userId).pipe(
      catchError((error) => {
        console.error('Error al obtener el usuario', error);
        return of(null);  // Devuelve null en caso de error para que no rompa el flujo
      })
    ).subscribe((user) => {
      if (user) {
        this.editUserForm.patchValue({
          name: user.name,
          email: user.email,
          rol: user.rol,
          company: user.company,
          cif: user.cif,
          dni: user.dni,
          studies: user.studies
        });
      }
    });
  }

  // Método para guardar los cambios
  onSave(): void {
    if (this.editUserForm.valid) {
      this.userService.updateUser(this.userId, this.editUserForm.value).pipe(
        catchError((error) => {
          console.error('Error al actualizar el usuario', error);
          return of(null);  // Manejo de errores en caso de falla
        })
      ).subscribe((updatedUser) => {
        if (updatedUser) {
          this.dialogRef.close(updatedUser);  // Cierra el modal y pasa el usuario actualizado
        }
      });
    }
  }

  // Método para cerrar el modal sin guardar
  onCancel(): void {
    this.dialogRef.close();
  }
}
