import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from '../../app.component';
import { UserListComponent } from "./user-list/user-list.component";

/**
 * AdminDashboardComponent
 * 
 * Este componente actúa como el panel de administración principal. Muestra los componentes
 * de usuario para cada rol (Administrador, Empresa y Visitante) y escucha cambios en el 
 * signal `userCreatedSignal` emitido desde `AppComponent`.
 * 
 * Este componente es autónomo (`standalone`) y se declara con sus componentes y módulos necesarios.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [
    CommonModule, // Importar CommonModule para funcionalidad básica
    UserListComponent
]
})
export class AdminDashboardComponent {

  /**
   * Referencia al componente principal de la aplicación.
   */
  private appComponent = inject(AppComponent);

  /**
   * Constructor del AdminDashboardComponent.
   * 
   * Inicializa el efecto para detectar cambios en el signal `userCreatedSignal`
   * de `AppComponent`. Si el signal está activo, indica que se ha creado un nuevo usuario
   * y recarga los componentes hijos.
   */
  constructor() {
    // Detectar el cambio del signal emitido por app.component
    effect(() => {
      if (this.appComponent.userCreatedSignal()) {
        console.log('Nuevo usuario creado. Recargando componentes hijos...');
        this.appComponent.userCreatedSignal.set(false);  // Reiniciamos el signal después de detectar el cambio
      }
    }, { allowSignalWrites: true });
  }
}
