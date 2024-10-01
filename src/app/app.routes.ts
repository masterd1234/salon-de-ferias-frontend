import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { AdminDashboardComponent } from './page/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] }
];
