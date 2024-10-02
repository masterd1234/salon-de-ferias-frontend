import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { AppComponent } from '../../../app.component';
import { MatDialog } from '@angular/material/dialog';
import { EditUsersComponent } from '../edit-users/edit-users.component';

@Component({
  selector: 'app-company-users',
  standalone: true,
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.css'],
  imports: [
    MatCardModule,  // Importar MatCard para las tarjetas
    MatButtonModule,  // Importar MatButton para los botones
    CommonModule  // Importar CommonModule para directivas básicas
  ]
})
export class CompanyUsersComponent implements OnInit {
  users = signal<any[]>([]);  // Signal para almacenar los usuarios

  private userService = inject(UserService);
  private appComponent = inject(AppComponent);
  private dialog = inject(MatDialog);

  constructor() {
    // Nos suscribimos a la señal de creación de usuarios
    effect(() => {
      if (this.appComponent.userCreatedSignal()) {
        this.loadCompanyUsers();  // Cargamos los usuarios cuando se crea uno nuevo
      }
    });
  }

  ngOnInit(): void {
    this.loadCompanyUsers();  // Cargar usuarios empresas
  }

  loadCompanyUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => this.users.set(data.filter(user => user.rol === 'co')),  // Filtrar usuarios con rol 'comapany'
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
        this.loadCompanyUsers(); // Recargar los usuarios si hubo cambios
      }
    });
  }

  // Eliminar usuario
  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe(() => {
      this.loadCompanyUsers(); // Recargar los usuarios después de eliminar
    });
  }
}
