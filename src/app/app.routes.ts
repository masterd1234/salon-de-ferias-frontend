import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { AdminDashboardComponent } from './page/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { CompanyDashboarComponent } from './page/company-dashboar/company-dashboar.component';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
    {path: 'company-dashboard', component: CompanyDashboarComponent, canActivate: [authGuard] }
];
