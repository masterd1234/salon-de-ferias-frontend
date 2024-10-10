import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { UserService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-user',
  standalone: true,
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatSelectModule,
    MatOptionModule
  ]
})
export class CreateUserComponent {

  createUserForm: FormGroup;
  isSubmitting = signal(false); // signal para manejar el estado de envío

  private dialogRef = inject(MatDialogRef<CreateUserComponent>);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    // Configuración del formulario reactivo
    this.createUserForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    this.createUserForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.updateValidationsBasedOnRole(rol);
    });
  }

  // Función para actualizar validaciones dinámicas basadas en el rol seleccionado
  updateValidationsBasedOnRole(rol: string) {
    const companyControl = this.createUserForm.get('company');
    const standIdControl = this.createUserForm.get('standId');
    const cifControl = this.createUserForm.get('cif');
    const dniControl = this.createUserForm.get('dni');
    const studiesControl = this.createUserForm.get('studies');

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



  // Método para manejar el envío del formulario
  onSubmit(): void {
    if (this.createUserForm.valid) {
      const newUser = this.createUserForm.value;
      console.log('Datos enviados:', newUser);  // Agrega esto para depuración

      // Obtenemos el token del AuthService
      const token = this.authService.getToken();
      if (!token) {
        console.error('No token available');
        return;
      }

      // Activar el signal de envío
      this.isSubmitting.set(true);

      // Llamada al servicio para crear el usuario
      this.userService.createUser(newUser).subscribe({
        next: (response) => {
          console.log('Usuario creado exitosamente', response);
          this.dialogRef.close(response);  // Cierra el modal y pasa el nuevo usuario creado
          this.isSubmitting.set(false);    // Desactivar el estado de envío
        },
        error: (err) => {
          console.error('Error al crear el usuario', err);
          this.isSubmitting.set(false);    // Desactivar el estado de envío
        }
      });
    }
  }


  // Método para cerrar el modal sin crear usuario
  onClose(): void {
    this.dialogRef.close();
  }
}
