import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { UserService } from '../../../services/admin.service';
import { AppComponent } from '../../../app.component';
import { EditUsersComponent } from '../edit-users/edit-users.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

/**
 * Componente reutilizable `UserListComponent`
 * Este componente muestra una lista de usuarios filtrada por rol.
 * También permite editar y eliminar usuarios mediante diálogos y servicios.
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  /** Título de la sección, configurable por `@Input` */
  @Input() title!: string;

  /** Rol de usuario para filtrar (admin, co, visitor) */
  @Input() role!: string;

  /** Lista de usuarios filtrada por rol */
  users = signal<any[]>([]);

  private userService = inject(UserService);
  private appComponent = inject(AppComponent);
  private dialog = inject(MatDialog);

  constructor() {
    // Nos suscribimos a la señal de creación de usuarios y recargamos cuando cambia
    effect(() => {
      if (this.appComponent.userCreatedSignal()) {
        this.loadUsers(); // Cargar usuarios según el rol cuando se crea un nuevo usuario
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers(); // Cargar usuarios al iniciar el componente
  }

  /**
   * Carga los usuarios y los filtra por rol
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => this.users.set(data.filter((user) => user.rol === this.role)),
      (error) => console.error(`Error al cargar los usuarios de rol ${this.role}`, error)
    );
  }

  /**
   * Alterna la visibilidad de información adicional de un usuario.
   * @param user Usuario al que se le muestra/oculta la información
   */
  toggleInfo(user: any): void {
    user.showInfo = !user.showInfo;
  }

  /**
   * Abre el diálogo de edición de usuario.
   * @param userId ID del usuario a editar
   */
  editUser(userId: string): void {
    const dialogRef = this.dialog.open(EditUsersComponent, {
      width: '400px',
      data: { userId }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers(); // Recargar usuarios si hubo cambios
      }
    });
  }

  /**
   * Elimina el usuario especificado y recarga la lista.
   * @param userId ID del usuario a eliminar
   */
  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe(() => {
      this.loadUsers(); // Recargar usuarios después de eliminar
    });
  }
}
