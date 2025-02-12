import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/users.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
  MatDialogActions,
  MatDialogContent,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';

/**
 * EditUsersComponent
 *
 * Este componente proporciona una interfaz para editar la información de un usuario
 * mediante un formulario reactivo en un diálogo modal.
 */
@Component({
  selector: 'app-edit-users',
  standalone: true,
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
  ],
  templateUrl: './edit-users.component.html',
  styleUrl: './edit-users.component.scss',
})
export class EditUsersComponent {
  /** Formulario reactivo para editar usuario */
  editUserForm: FormGroup;

  /** ID del usuario que se está editando */
  userId: string;

  /** Inyección de servicios y dependencias */
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditUsersComponent>);
  private userService = inject(UserService);
  private dialogData = inject(MAT_DIALOG_DATA);

  /**
   * Constructor del componente EditUsersComponent.
   * Inicializa el formulario de edición de usuario y configura validaciones dinámicas
   * basadas en el rol seleccionado.
   */
  constructor() {
    this.userId = this.dialogData.userId; // ID del usuario pasado al modal
    this.editUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      rol: ['', Validators.required],
      company: [''], // Campo adicional para rol "co"
      standId: [''],
      cif: [''],
      dni: [''], // Campo adicional para rol "visitante"
      studies: [''],
    });

    // Escucha cambios en el campo "rol" para actualizar validaciones
    this.editUserForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.updateValidationsBasedOnRole(rol);
    });
  }

  /**
   * Actualiza las validaciones del formulario de acuerdo al rol seleccionado.
   *
   * @param rol - El rol seleccionado, que puede ser "co", "visitor", o "admin".
   */
  updateValidationsBasedOnRole(rol: string) {
    const companyControl = this.editUserForm.get('company');
    const standIdControl = this.editUserForm.get('standId');
    const cifControl = this.editUserForm.get('cif');
    const dniControl = this.editUserForm.get('dni');
    const studiesControl = this.editUserForm.get('studies');

    // Resetea las validaciones
    companyControl?.clearValidators();
    standIdControl?.clearValidators();
    cifControl?.clearValidators();
    dniControl?.clearValidators();
    studiesControl?.clearValidators();

    if (rol === 'co') {
      // Activar validaciones específicas para rol "co"
      companyControl?.setValidators([Validators.required]);
      standIdControl?.setValidators([Validators.required]);
      cifControl?.setValidators([Validators.required]);
    } else if (rol === 'visitor') {
      // Activar validaciones específicas para rol "visitor"
      dniControl?.setValidators([Validators.required]);
      studiesControl?.setValidators([Validators.required]);
    }

    // Actualiza el estado de los controles
    companyControl?.updateValueAndValidity();
    standIdControl?.updateValueAndValidity();
    cifControl?.updateValueAndValidity();
    dniControl?.updateValueAndValidity();
    studiesControl?.updateValueAndValidity();
  }

  /**
   * Inicializa el componente y carga los datos del usuario en el formulario.
   */
  ngOnInit(): void {
    this.userService
      .getUserById(this.userId)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener el usuario', error);
          return of(null); // Devuelve null en caso de error
        })
      )
      .subscribe((user) => {
        if (user) {
          this.editUserForm.patchValue({
            name: user.name,
            email: user.email,
            phone: user.phone,
            rol: user.rol,
            dni: user.dni,
            studies: user.studies,
          });
        }
      });
  }

  /**
   * Guarda los cambios realizados en el formulario.
   * Si el formulario es válido, envía los datos al servicio y cierra el diálogo.
   */
  onSave(): void {
    if (this.editUserForm.valid) {
      this.userService
        .updateUser(this.userId, this.editUserForm.value)
        .pipe(
          catchError((error) => {
            console.error('Error al actualizar el usuario', error);
            return of(null);
          })
        )
        .subscribe((updatedUser) => {
          if (updatedUser) {
            this.dialogRef.close(updatedUser); // Cierra el modal y pasa el usuario actualizado
          }
        });
    }
  }

  /**
   * Cierra el modal sin guardar cambios.
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
