import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../services/auth.service';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCheckboxModule, HttpClientModule, CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  hide = true; //signal para ocultar/mostrar la contraseña
  privacyAccepted = false; //signal para aceptar la política de privacidad
  termsAccepted = false;  //signal para aceptar los terminos y condiciones
  loginForm: FormGroup; // Formulario reactivo


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Configuramos el formulario reactivo
    this.loginForm = this.fb.group({
      nameOrEmail: ['', [Validators.required]], // Campo nombre de usuario requerido
      password: ['', [Validators.required, Validators.minLength(6)]], // Campo contraseña requerido con mínimo 6 caracteres
    });
  }


  // Alternar visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }


  // Cambiar el estado de aceptación de la política de privacidad
  onPrivacyChange(event: MatCheckboxChange): void {
    this.privacyAccepted = event.checked;
  }


  // Cambiar el estado de aceptación de los términos y condiciones
  onTermsChange(event: MatCheckboxChange): void {
    this.termsAccepted = event.checked;
  }

  // Método para manejar el envío del formulario
  login(): void {
    if (this.loginForm.valid && this.privacyAccepted && this.termsAccepted) {
      const { nameOrEmail, password } = this.loginForm.value;

      // Llamada al servicio de autenticación
      this.authService.login(nameOrEmail, password).subscribe({
        next: (response) => {
          // Verifica si el token está presente en la respuesta
          if (response.token) {
            // Guardamos el token JWT en el localStorage
            this.authService.setToken(response.token);
            const decodedToken: any = jwtDecode(response.token);
            const userRole = decodedToken.rol;

            
            // Redirigir al dashboard o área según el rol
            if (userRole === 'admin') {
              this.router.navigate(['/admin-dashboard']);
            } else if (userRole === 'co') {
              this.router.navigate(['/company-dashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          } else {
            alert('Credenciales inválidas');
          }
        },
        error: (err) => {
          alert('Error en la autenticación: ' + err.message);
        }
      });
    } else {
      alert('Por favor, completa el formulario correctamente y acepta los términos.');
    }
  }


}
