import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/admin.service';
import { AppComponent } from '../../../app.component';
import { MatDialog } from '@angular/material/dialog';
import { EditUsersComponent } from '../edit-users/edit-users.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  imports: [
    MatCardModule,  // Importar MatCard para las tarjetas
    MatButtonModule,  // Importar MatButton para los botones
    CommonModule // Importar CommonModule para directivas básicas
  ]
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);  // Signal para almacenar los usuarios

  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private appComponent = inject(AppComponent);

  ngOnInit(): void {
    this.loadAdminUsers();  // Cargar usuarios administradores
  }

  constructor() {
    // Nos suscribimos a la señal de creación de usuarios
    effect(() => {
      if (this.appComponent.userCreatedSignal()) {
        this.loadAdminUsers();  // Cargamos los usuarios cuando se crea uno nuevo
      }
    });
  }

  loadAdminUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => this.users.set(data.filter(user => user.rol === 'admin')),  // Filtrar usuarios con rol 'admin'
      (error) => console.error('Error al cargar los usuarios', error)
    );
  }

  toggleInfo(user: any): void {
    user.showInfo = !user.showInfo;
  }

  // Abrir el modal para editar un usuario
  editUser(userId: string): void {
    const dialogRef = this.dialog.open(EditUsersComponent, {
      width: '400px',
      data: { userId } // Pasar el ID del usuario al modal
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadAdminUsers(); // Recargar los usuarios si hubo cambios
      }
    });
  }

  // Eliminar usuario
  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe(() => {
      this.loadAdminUsers(); // Recargar los usuarios después de eliminar
    });
  }
}
