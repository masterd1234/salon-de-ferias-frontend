import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http'; // Si vas a hacer peticiones HTTP
import { UserService } from '../../services/user.service'; // Servicio para interactuar con el backend
import { MatButtonModule } from '@angular/material/button'; // Para usar botones de Angular Material
import { MatDialog } from '@angular/material/dialog';
import { CreateUserComponent } from '../create-user/create-user.component';
import { Overlay } from '@angular/cdk/overlay';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardHeader,
    MatCardActions,
    MatCardContent,
    MatCard,
    MatCardTitle,
    HttpClientModule,
    MatButtonModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Array para almacenar los usuarios
  users = signal<any[]>([]);

  // Inyectamos el servicio de usuarios
  private userService = inject(UserService);
  private appComponent = inject(AppComponent);

  constructor() {
    // Colocamos el effect dentro del constructor para que se ejecute en el contexto de inyección adecuado
    effect(() => {
      if (this.appComponent.userCreatedSignal()) {
        console.log('Detectado un nuevo usuario creado. Recargando lista de usuarios...');
        this.loadUsers(); // Recargar la lista de usuarios
        this.appComponent.userCreatedSignal.set(false); // Restablecer el signal
      }
    }, {allowSignalWrites: true});
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.loadUsers(); // Cargar los usuarios al iniciar
  }

  // Método para cargar los usuarios desde el servicio
  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (data) => this.users.set(data.map(user => ({ ...user, showInfo: false }))),
      (error) => console.error('Error al cargar los usuarios', error)
    );
  }

  // Alternar la visibilidad de la información adicional del usuario
  toggleInfo(user: any): void {
    user.showInfo = !user.showInfo;
  }

  // Método para editar un usuario
  editUser(userId: string): void {
    console.log(`Editar usuario con ID: ${userId}`);
    // Lógica para editar
  }

  // Método para eliminar un usuario
  deleteUser(userId: string): void {
    console.log(`Eliminar usuario con ID: ${userId}`);
    // Lógica para eliminar un usuario (hacer una petición DELETE al backend)
  }
}
