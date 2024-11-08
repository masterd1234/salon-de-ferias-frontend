import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode }  from 'jwt-decode';

/**
 * @constant {CanActivateFn} authGuard
 * @description Guard de autorización que protege las rutas verificando si el usuario tiene un token válido y un rol específico ('admin' o 'co').
 * Si el token está ausente o el rol no es permitido, redirige al usuario a la página de inicio.
 * @param {ActivatedRouteSnapshot} route - Snapshot de la ruta actual.
 * @param {RouterStateSnapshot} state - Estado de la URL actual.
 * @returns {boolean} `true` si el usuario tiene el rol adecuado, de lo contrario `false`.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  if (token) {
    const decodedToken: any = jwtDecode(token);

    // Verificar si el rol es 'admin' o 'co'
    if (decodedToken.rol === 'admin' || decodedToken.rol === 'co') {
      return true;
    } else {
      // Redirigir si el rol no es autorizado
      router.navigate(['/home']);
      return false;
    }
  } else {
    // Redirigir si no hay token
    router.navigate(['/home']);
    return false;
  }
};
