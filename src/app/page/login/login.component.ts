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


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  hide = signal(true); //signal para ocultar/mostrar la contraseña
  privacyAccepted = signal(false); //signal para aceptar la política de privacidad
  termsAccepted = signal(false);  //signal para aceptar los terminos y condiciones
  loginForm: FormGroup; // Formulario reactivo


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Configuramos el formulario reactivo
    this.loginForm = this.fb.group({
      name: ['', [Validators.required]], // Campo nombre de usuario requerido
      password: ['', [Validators.required, Validators.minLength(6)]], // Campo contraseña requerido con mínimo 6 caracteres
    });
  }


  // Alternar visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.hide.set(!this.hide());
  }


  // Cambiar el estado de aceptación de la política de privacidad
  onPrivacyChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.privacyAccepted.set(checked);
  }


  // Cambiar el estado de aceptación de los términos y condiciones
  onTermsChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.termsAccepted.set(checked);
  }

  // Método para manejar el envío del formulario
  login(): void {
    if (this.loginForm.valid && this.privacyAccepted() && this.termsAccepted()) {
      const { name, password } = this.loginForm.value;

      // Llamada al servicio de autenticación
      this.authService.login(name, password).subscribe({
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
              this.router.navigate(['/co-dashboard']);
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
