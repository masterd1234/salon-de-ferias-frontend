import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  if (token) {
    const decodedToken: any = jwtDecode(token);

    // Verificar si el rol es 'admin'
    if (decodedToken.rol === 'admin') {
      return true;
    } else if (decodedToken.rol === 'co') {
      return true;
    }else {
      router.navigate(['/login']);
      return false;
    }
  } else {
    // Redirigir si no hay token
    router.navigate(['/login']);
    return false;
  }
};
