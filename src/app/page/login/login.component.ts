import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { UserService } from '../../services/users.service';

/**
 * LoginComponent
 *
 * Este componente gestiona el formulario de inicio de sesión de usuarios
 * para la aplicación. Incluye campos para el usuario o correo electrónico,
 * la contraseña y dos casillas de verificación para aceptar la política
 * de privacidad y los términos y condiciones.
 *
 * Funcionalidades principales:
 * - Validación de formulario con campos obligatorios.
 * - Ocultación/muestreo de la contraseña.
 * - Envío de credenciales al servicio de autenticación y redirección
 *   según el rol del usuario.
 */

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCheckboxModule,
    HttpClientModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // Control de visibilidad de la contraseña
  hide = true;

  // Estados de aceptación para los checkbox de política de privacidad y términos y condiciones
  privacyAccepted = false;
  termsAccepted = false;

  // Formulario reactivo para capturar las credenciales de inicio de sesión
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    // Configuración del formulario de inicio de sesión
    this.loginForm = this.fb.group({
      nameOrEmail: ['', [Validators.required]], // Campo requerido para nombre o correo
      password: ['', [Validators.required, Validators.minLength(6)]], // Campo requerido para contraseña
    });
  }

  /**
   * Alterna la visibilidad de la contraseña entre texto y oculto.
   */
  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  /**
   * Maneja el cambio en el checkbox de política de privacidad.
   *
   * @param event - El cambio del checkbox
   */
  onPrivacyChange(event: MatCheckboxChange): void {
    this.privacyAccepted = event.checked;
  }

  /**
   * Maneja el cambio en el checkbox de términos y condiciones.
   *
   * @param event - El cambio del checkbox
   */
  onTermsChange(event: MatCheckboxChange): void {
    this.termsAccepted = event.checked;
  }

  /**
   * Envía el formulario de inicio de sesión si es válido y
   * las condiciones son aceptadas.
   */
  login(): void {
    if (this.loginForm.valid) {
      const { nameOrEmail, password } = this.loginForm.value;

      this.authService.login(nameOrEmail, password).subscribe({
        next: (response) => {
          if (response.success) {
            // Redirige según el rol del usuario
            switch (response.user?.rol) {
              case 'admin':
                this.router.navigate(['/admin-dashboard']);
                break;
              case 'co':
                this.router.navigate(['/profile']);
                break;
              case 'visitor':
                this.router.navigate(['/home-visitor']);
                break;
              default:
                this.router.navigate(['/landing-page']);
                break;
            }
          } else {
            // Muestra un mensaje si el backend devolvió un error
            alert('Error en la autenticación: ' + response.message);
          }
        },
        error: (err) => {
          // Manejo adicional de errores inesperados
          alert('Error inesperado en la autenticación.');
          console.error(err);
        },
      });
    } else {
      alert(
        'Por favor, completa el formulario correctamente y acepta los términos.'
      );
    }
  }
}
