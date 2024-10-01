import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CreateUserComponent } from './page/create-user/create-user.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { AdminDashboardComponent } from './page/admin-dashboard/admin-dashboard.component';
import { sign } from 'crypto';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LoginComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'palacio-de-ferias';

  // Signal para notificar la creacion de un usuario
  userCreatedSignal = signal(false);
  // Inyectamos AuthService y Router
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);  // Inyectar MatDialog para manejar el modal
  private overlay = inject(Overlay);

  // Verifica si el usuario está logueado
  isLoggedIn(): boolean {
    return !!this.authService.getToken();  // Comprueba si el token está presente en el localStorage
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();  // Llama al método de logout del AuthService
    this.router.navigate(['/login']);  // Redirige al usuario a la página de login
  }

  // Método para abrir el modal y crear un nuevo usuario
  createUser(): void {
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '500px',
      hasBackdrop: true,  // Asegúrate de que tenga un fondo de sombra
      autoFocus: false,   // Evita que el foco automático lo empuje hacia abajo
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    // Cuando se cierra el modal
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nuevo usuario creado:', result);
        this.userCreatedSignal.set(true);
      }
    });
  }

}
