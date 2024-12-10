import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, catchError, of } from 'rxjs';
import { TokenService } from '../services/cookie.service';

/**
 * @constant {CanActivateFn} authGuard
 * @description Guard de autorización que protege las rutas verificando si el usuario está autenticado.
 * Si el usuario no está autenticado, lo redirige a la página de inicio de sesión.
 * @param {ActivatedRouteSnapshot} route - Snapshot de la ruta actual.
 * @param {RouterStateSnapshot} state - Estado de la URL actual.
 * @returns {Observable<boolean>} `true` si el usuario está autenticado, de lo contrario `false`.
 */
export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return tokenService.isAuthenticated().pipe(
    map((authenticated) => {
      if (authenticated) {
        return true; // Usuario autenticado, permitir acceso
      } else {
        router.navigate(['/login']); // Redirigir al login si no está autenticado
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']); // Redirigir al login en caso de error
      return of(false); // Retorna false si ocurre un error
    })
  );
};
