import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

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
         path: '', redirectTo: 'home', pathMatch: 'full' 
    },

    /**
     * Ruta de la página de inicio.
     * @path /home
     * @component HomeComponent (cargado de forma diferida)
     */
    {
        path: 'home',
        loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent)
    },

    /**
     * Ruta para la página de inicio de sesión.
     * @path /login
     * @component LoginComponent (cargado de forma diferida)
     */
    {
        path: 'login',
        loadComponent: () => import('./page/login/login.component').then(m => m.LoginComponent)
    },

    /**
     * Ruta para el panel de administración, protegida por `authGuard` y cargada de forma diferida.
     * @path /admin-dashboard
     */
    {
        path: 'admin-dashboard',
        loadComponent: () => import('./page/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [authGuard]
    },

    /**
     * Ruta para el panel de la empresa, protegida por `authGuard` y cargada de forma diferida.
     * @path /company-dashboard
     */
    {
        path: 'company-dashboard',
        loadComponent: () => import('./page/company-dashboar/company-dashboar.component').then(m => m.CompanyDashboarComponent),
        canActivate: [authGuard]
    },

    /**
     * Ruta para el perfil del usuario, protegida por `authGuard` y cargada de forma diferida.
     * @path /profile
     */
    {
        path: 'profile',
        loadComponent: () => import('./page/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },

    /**
     * Ruta para ver todas las ofertas, protegida por `authGuard` y cargada de forma diferida.
     * @path /offers
     */
    {
        path: 'offers',
        loadComponent: () => import('./page/all-offers/all-offers.component').then(m => m.AllOffersComponent),
        canActivate: [authGuard]
    }
];
