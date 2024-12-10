import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CreateUserComponent } from './page/admin-dashboard/create-user/create-user.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CompanyService } from './services/information.service';
import { UserService } from './services/users.service';
import { TokenService } from './services/cookie.service';
import { Observable } from 'rxjs';

/**
 * @class AppComponent
 * @description Componente raíz de la aplicación que gestiona la estructura principal, el estado de sesión,
 * el rol del usuario, y ofrece funcionalidades para crear usuarios y navegar.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, MatSidenavModule, MatToolbarModule, MatListModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /**
   * @property {string} title - Título de la aplicación.
   */
  title = 'palacio-de-ferias';

  /**
   * @property {boolean} isSmallScreen - Indica si la pantalla es pequeña (para ajustar la navegación).
   */
  isSmallScreen = false;

  companyDashboardComplete: boolean = false;

  /**
   * @property {MatSidenav} drawer - Referencia al componente de navegación lateral (sidenav).
   * @ViewChild
   */
  @ViewChild('drawer') drawer!: MatSidenav;


  /**
   * @property {'side' | 'over'} sidenavMode - Modo de visualización del `sidenav` dependiendo del tamaño de pantalla.
   */
  sidenavMode: 'side' | 'over' = 'side';

  /**
   * @property {signal<boolean>} userCreatedSignal - Signal para notificar la creación de un usuario.
   */
  userCreatedSignal = signal(false);
  isLoggedIn = false;
  user: { name: string; rol: string } | null = null;

  // Inyectamos AuthService, Router, MatDialog y Overlay
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private overlay = inject(Overlay);
  private tokenService = inject(TokenService);

  /**
   * @constructor
   * @param {BreakpointObserver} breakpointObserver - Observador de puntos de quiebre de pantalla para manejar tamaños responsivos.
   */
  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
      this.sidenavMode = this.isSmallScreen ? 'over' : 'side';
    });
  }


  logged():boolean {
    return this.isLoggedIn = this.authService.isLoggedIn();
  }

  /**
   * @method toggleDrawer
   * @description Abre o cierra el `drawer` en pantallas pequeñas.
   * @returns {void}
   */
  toggleDrawer(): void {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  /**
   * @method isLoggedIn
   * @description Verifica si el usuario está autenticado revisando la presencia de un token en `localStorage`.
   * @returns {boolean} `true` si el usuario está autenticado, `false` si no lo está.
   */


  /**
   * @method isRol
   * @description Verifica el rol del usuario (admin o co) decodificando el token de autenticación.
   * @returns {string} Retorna `'admin'`, `'co'`, o una cadena vacía si no tiene un rol válido.
   */
  isRol(): string {
    this.user = this.authService.getUser();
    if (this.user) {
    return this.user.rol;
    } else
    return '';
  }

  /**
   * @method logout
   * @description Cierra la sesión del usuario eliminando el token de autenticación y redirige a la página de inicio.
   * @returns {void}
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  /**
   * @method createUser
   * @description Abre un modal para crear un nuevo usuario, y establece `userCreatedSignal` a `true` si se crea uno.
   * @returns {void}
   */
  createUser(): void {
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '500px',
      hasBackdrop: true,
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Nuevo usuario creado:', result);
        this.userCreatedSignal.set(true);
      }
    });
  }
}
