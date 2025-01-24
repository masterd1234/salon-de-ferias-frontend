import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MapComponent } from './page/map/map.component';

/**
 * @constant {Routes} routes
 * @description Definición de rutas para la aplicación, especificando los componentes que se renderizan para cada ruta y aplicando restricciones de acceso mediante `authGuard` en rutas protegidas.
 */
export const routes: Routes = [
  /**
   * Ruta principal de la aplicación.
   * @path /
   * @component HomeComponent (cargado de forma diferida)
   */
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  /**
   * Ruta de la página de inicio.
   * @path /home
   * @component HomeComponent (cargado de forma diferida)
   */
  {
    path: 'home',
    loadComponent: () =>
      import('./page/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./page/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  {
    path: 'map',
    loadComponent: () =>
      import('./page/map/map.component').then((m) => m.MapComponent),
  },

  /**
   * Ruta para la página de inicio de sesión.
   * @path /login
   * @component LoginComponent (cargado de forma diferida)
   */
  {
    path: 'login',
    loadComponent: () =>
      import('./page/login/login.component').then((m) => m.LoginComponent),
  },

  /**
   * Ruta para el panel de administración, protegida por `authGuard` y cargada de forma diferida.
   * @path /admin-dashboard
   */
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./page/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },

  /**
   * Ruta para el panel de la empresa, protegida por `authGuard` y cargada de forma diferida.
   * @path /company-dashboard
   */
  {
    path: 'company-dashboard',
    loadComponent: () =>
      import('./page/company-dashboar/company-dashboar.component').then(
        (m) => m.CompanyDashboarComponent
      ),
  },

  /**
   * Ruta para el perfil del usuario, protegida por `authGuard` y cargada de forma diferida.
   * @path /profile
   */
  {
    path: 'profile',
    loadComponent: () =>
      import('./page/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },

  /**
   * Ruta para ver todas las ofertas, protegida por `authGuard` y cargada de forma diferida.
   * @path /offers
   */
  {
    path: 'offers',
    loadComponent: () =>
      import('./page/all-offers/all-offers.component').then(
        (m) => m.AllOffersComponent
      ),
  },
  /**
   * Ruta para ver todas las ofertas, protegida por `authGuard` y cargada de forma diferida.
   * @path /offers
   */
  {
    path: 'employability-fair-hall',
    loadComponent: () =>
      import(
        './page/employability-fair-hall/employability-fair-hall.component'
      ).then((m) => m.EmployabilityFairHallComponent),
  },
];
