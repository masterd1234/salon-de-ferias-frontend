import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { AdminDashboardComponent } from './page/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { CompanyDashboarComponent } from './page/company-dashboar/company-dashboar.component';
import { ProfileComponent } from './page/profile/profile.component';
import { OffersComponent } from './page/profile/offers/offers.component';


export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
    {path: 'company-dashboard', component: CompanyDashboarComponent, canActivate: [authGuard] },
    {path: 'profile', component: ProfileComponent, canActivate: [authGuard]},
    {path: 'offers', component: OffersComponent, canActivate: [authGuard]}
];
