import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { UserService } from '../../../services/users.service';
import { CommonModule } from '@angular/common';

/**
 * @class CreateUserComponent
 * @description Este componente permite crear un nuevo usuario mediante un formulario reactivo dentro de un modal.
 */
@Component({
  selector: 'app-create-user',
  standalone: true,
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatSelectModule,
    MatOptionModule,
  ]
})
export class CreateUserComponent {
  /** Formulario reactivo para crear usuario */
  createUserForm: FormGroup;

  /** Estado de envío del formulario */
  isSubmitting = signal(false);

  /** Dependencias inyectadas */
  private dialogRef = inject(MatDialogRef<CreateUserComponent>);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  /**
   * Constructor del componente CreateUserComponent.
   * Configura el formulario reactivo y las validaciones de los campos.
   */
  constructor() {
    // Configuración del formulario reactivo
    this.createUserForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required],
      company: [''], // Campo adicional para rol "co"
      cif: [''], // Campo adicional para rol "co"
      dni: [''], // Campo adicional para rol "visitor"
      studies: [''], // Campo adicional para rol "visitor"
    });

    // Actualizar validaciones en base al rol seleccionado
    this.createUserForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.updateFieldValidations(rol);
    });
  }

  /**
   * Actualiza las validaciones de los campos en función del rol seleccionado.
   * 
   * @param rol - El rol seleccionado, puede ser "co" o "visitor".
   */
  private updateFieldValidations(rol: string) {
    // Limpiar validaciones anteriores
    const fields = ['company', 'cif', 'dni', 'studies'];
    fields.forEach((field) => this.createUserForm.get(field)?.clearValidators());

    // Aplicar validaciones específicas para cada rol
    if (rol === 'co') {
      this.createUserForm.get('company')?.setValidators([Validators.required]);
      this.createUserForm.get('cif')?.setValidators([Validators.required]);
    } else if (rol === 'visitor') {
      this.createUserForm.get('dni')?.setValidators([Validators.required]);
      this.createUserForm.get('studies')?.setValidators([Validators.required]);
    }

    // Actualizar el estado de los campos
    fields.forEach((field) => this.createUserForm.get(field)?.updateValueAndValidity());
  }

  /**
   * Maneja el envío del formulario.
   * Envía los datos del nuevo usuario al servicio y cierra el modal si es exitoso.
   */
  onSubmit(): void {
    if (this.createUserForm.valid) {
      const newUser = this.createUserForm.value;
      this.cleanFieldsBasedOnRole(newUser);

      this.isSubmitting.set(true);
      this.userService.createUser(newUser).subscribe({
        next: (response) => {
          console.log('Usuario creado exitosamente:', response);
          this.dialogRef.close(response);
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Error al crear el usuario:', err);
          alert('Ocurrió un error al crear el usuario.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  /**
   * Elimina los campos irrelevantes del objeto `newUser` dependiendo del rol seleccionado.
   * 
   * @param newUser - Objeto de usuario a limpiar.
   */
  private cleanFieldsBasedOnRole(newUser: any) {
    if (newUser.rol === 'co') {
      delete newUser.dni;
      delete newUser.studies;
    } else if (newUser.rol === 'visitor') {
      delete newUser.company;
      delete newUser.cif;
    }
  }

  /**
   * Cierra el diálogo sin crear un usuario.
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
