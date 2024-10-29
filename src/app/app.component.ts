import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CreateUserComponent } from './page/admin-dashboard/create-user/create-user.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { AdminDashboardComponent } from './page/admin-dashboard/admin-dashboard.component';
import { sign } from 'crypto';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LoginComponent, CommonModule, MatSidenavModule, MatToolbarModule, MatListModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'palacio-de-ferias';

  isSmallScreen = false;
  @ViewChild('drawer') drawer!: MatSidenav;
  // Signal para notificar la creacion de un usuario
  userCreatedSignal = signal(false);
  // Inyectamos AuthService y Router
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);  // Inyectar MatDialog para manejar el modal
  private overlay = inject(Overlay);

  constructor(private breakpointObserver: BreakpointObserver){
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe (result => {
      this.isSmallScreen = result.matches;
    })
  }

    // Método para abrir o cerrar el drawer en pantallas pequeñas
    toggleDrawer(): void {
      if (this.drawer) {
        this.drawer.toggle();
      }
    }

  // Verifica si el usuario está logueado
  isLoggedIn(): boolean {
    return !!this.authService.getToken();  // Comprueba si el token está presente en el localStorage
  }

  // Verifica si el usuario es Admin o CO
  isRol(): string {
    const tokenData = this.authService.decodeToken();

    if (tokenData?.rol === 'admin') {
      return 'admin';
    } else if (tokenData?.rol === 'co') {
      return 'co';
    }

    return ''; // Devuelve una cadena vacía si no es ni 'admin' ni 'co'
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
