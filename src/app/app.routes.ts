import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { AdminDashboardComponent } from './page/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { CompanyDashboarComponent } from './page/company-dashboar/company-dashboar.component';
import { ProfileComponent } from './page/profile/profile.component';
import { AllOffersComponent } from './page/all-offers/all-offers.component';
import { HomeComponent } from './page/home/home.component';

/**
 * @constant {Routes} routes
 * @description Definición de rutas para la aplicación, especificando los componentes que se renderizan para cada ruta y aplicando restricciones de acceso mediante `authGuard` en rutas protegidas.
 */
export const routes: Routes = [
    /**
     * Ruta principal de la aplicación.
     * @path /
     * @component HomeComponent
     */
    { path: '', component: HomeComponent },
    
    /**
     * Ruta de la página de inicio.
     * @path /home
     * @component HomeComponent
     */
    { path: 'home', component: HomeComponent },

    /**
     * Ruta para la página de inicio de sesión.
     * @path /login
     * @component LoginComponent
     */
    { path: 'login', component: LoginComponent },

    /**
     * Ruta para el panel de administración, protegida por `authGuard`.
     * @path /admin-dashboard
     * @component AdminDashboardComponent
     * @canActivate [authGuard]
     */
    { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },

    /**
     * Ruta para el panel de la empresa, protegida por `authGuard`.
     * @path /company-dashboard
     * @component CompanyDashboarComponent
     * @canActivate [authGuard]
     */
    { path: 'company-dashboard', component: CompanyDashboarComponent, canActivate: [authGuard] },

    /**
     * Ruta para el perfil del usuario, protegida por `authGuard`.
     * @path /profile
     * @component ProfileComponent
     * @canActivate [authGuard]
     */
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

    /**
     * Ruta para ver todas las ofertas, protegida por `authGuard`.
     * @path /offers
     * @component AllOffersComponent
     * @canActivate [authGuard]
     */
    { path: 'offers', component: AllOffersComponent, canActivate: [authGuard] }
];
