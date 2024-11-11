import { AfterViewChecked, AfterViewInit, Component, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { CompanyUsersComponent } from './company-users/company-users.component';
import { VisitorUsersComponent } from "./visitor-users/visitor-users.component";
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  imports: [
    AdminUsersComponent, // Importar el componente de administradores
    CompanyUsersComponent,
    CommonModule, // Importar CommonModule para funcionalidad básica
    VisitorUsersComponent
  ]
})
export class AdminDashboardComponent {

  private appComponent = inject(AppComponent);

  constructor() {
    // Detectar el cambio del signal emitido por app.component
    effect(() => {
      if (this.appComponent.userCreatedSignal()) {
        console.log('Nuevo usuario creado. Recargando componentes hijos...');
        this.appComponent.userCreatedSignal.set(false);  // Reiniciamos el signal después de detectar el cambio
      }
    },{ allowSignalWrites: true });
  }
}
