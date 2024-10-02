import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { AppComponent } from '../../../app.component';

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

  editUser(userId: string): void {
    console.log(`Editar admin con ID: ${userId}`);
  }

  deleteUser(userId: string): void {
    console.log(`Eliminar admin con ID: ${userId}`);
  }
}
