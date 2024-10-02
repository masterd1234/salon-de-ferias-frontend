import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogContent, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

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
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Cargar los datos del usuario
    this.userService.getUserById(this.userId).subscribe((user) => {
      this.editUserForm.patchValue({
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      });
    });
  }

  // Método para guardar los cambios
  onSave(): void {
    if (this.editUserForm.valid) {
      this.userService.updateUser(this.userId, this.editUserForm.value).subscribe((updatedUser) => {
        this.dialogRef.close(updatedUser); // Cierra el modal y pasa el usuario actualizado
      });
    }
  }

  // Método para cerrar el modal sin guardar
  onCancel(): void {
    this.dialogRef.close();
  }
}
