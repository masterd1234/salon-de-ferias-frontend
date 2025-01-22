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
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCheckboxModule,
    HttpClientModule,
    MatTabsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  // Control de visibilidad de la contraseña
  hide = true;

  /** URL de previsualización de archivos subidos. */
  cvUrl: string | null = null;
  profileImageUrl: string | null = null;
  logoUrl: string | null = null;

  profileImageFile: File | null = null; // Archivo cargado para el banner
  cvFile: File | null = null; // Archivo cargado para el póster
  logoFile: File | null = null; // Archivo cargado para el logo

  /** Nombres de los archivos subidos. */
  logoFileName: string = '';
  profileImageFileName: string = '';
  cvFileName: string = '';

  // Estados de aceptación para los checkbox de política de privacidad y términos y condiciones
  privacyAccepted = false;
  termsAccepted = false;

  // Formulario reactivo para capturar las credenciales de inicio de sesión
  companyRegister: FormGroup;
  visitorRegister: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fb1: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    // Configuración del formulario de inicio de sesión
    this.companyRegister = this.fb.group({
      name: ['', [Validators.required]], // Campo requerido para nombre o correo
      password: ['', [Validators.required, Validators.minLength(6)]], // Campo requerido para contraseña
      email: ['', [Validators.required, Validators.email]], // Campo requerido para correo electrónico
      rol: ['co'],
      logo: [''],
      cif: ['', Validators.required],
    });

    // Configuración del formulario de inicio de sesión
    this.visitorRegister = this.fb1.group({
      name: ['', [Validators.required]], // Campo requerido para nombre o correo
      subname: [''], // Campo requerido para nombre o correo
      phone: [''], // Campo requerido para nombre o correo
      studies: [''], // Campo requerido para nombre o correo
      dni: [''], // Campo requerido para nombre o correo
      password: ['', [Validators.required, Validators.minLength(6)]], // Campo requerido para contraseña
      email: ['', [Validators.required, Validators.email]], // Campo requerido para correo electrónico
      rol: ['visitor'],
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

  registerCompany(): void {
    if (this.companyRegister.invalid) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const formData = new FormData();

    formData.append('name', this.companyRegister.get('name')?.value);
    formData.append('password', this.companyRegister.get('password')?.value);
    formData.append('email', this.companyRegister.get('email')?.value);
    formData.append('rol', this.companyRegister.get('rol')?.value);
    formData.append('cif', this.companyRegister.get('cif')?.value);

    if (this.logoFile) formData.append('logo', this.logoFile);

    this.userService.createUser(formData).subscribe({
      next: (response) => {
        const username = this.companyRegister.get('name')?.value;
        const password = this.companyRegister.get('password')?.value;

        if (username && password) {
          this.authService.login(username, password).subscribe({
            next: (loginResponse) => {
              if (loginResponse.success) {
                switch (loginResponse.user?.rol) {
                  case 'admin':
                    this.router.navigate(['/admin-dashboard']);
                    break;
                  case 'co':
                    this.router.navigate(['/company-dashboard']);
                    break;
                  default:
                    this.router.navigate(['/home']);
                    break;
                }
              } else {
                alert('Error en la autenticación: ' + loginResponse.message);
              }
            },
            error: (err) => {
              alert(
                'Error inesperado en la autenticación: ' + err.error?.message ||
                  'Error desconocido.'
              );
              console.error(err);
            },
          });
        } else {
          alert('Faltan datos para iniciar sesión.');
        }
      },
      error: (err) => {
        const errorMessage =
          err.error?.message || 'Error desconocido al crear el usuario.';
        alert('Error al crear usuario: ' + errorMessage);
        console.error('Error al crear el usuario', err);
      },
    });
  }

  registerVisitor(): void {
    if (this.visitorRegister.invalid) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const formData = new FormData();

    formData.append('name', this.visitorRegister.get('name')?.value);
    formData.append('subname', this.visitorRegister.get('subname')?.value);
    formData.append('phone', this.visitorRegister.get('phone')?.value);
    formData.append('studies', this.visitorRegister.get('studies')?.value);
    formData.append('dni', this.visitorRegister.get('dni')?.value);
    formData.append('password', this.visitorRegister.get('password')?.value);
    formData.append('email', this.visitorRegister.get('email')?.value);
    formData.append('rol', this.visitorRegister.get('rol')?.value);

    if (this.logoFile) formData.append('logo', this.logoFile);

    this.userService.createUser(formData).subscribe({
      next: (response) => {
        const username = this.visitorRegister.get('name')?.value;
        const password = this.visitorRegister.get('password')?.value;

        if (username && password) {
          this.authService.login(username, password).subscribe({
            next: (loginResponse) => {
              if (loginResponse.success) {
                this.router.navigate(['/home']);
              } else {
                alert('Error en la autenticación: ' + loginResponse.message);
              }
            },
            error: (err) => {
              alert(
                'Error inesperado en la autenticación: ' + err.error?.message ||
                  'Error desconocido.'
              );
              console.error(err);
            },
          });
        } else {
          alert('Faltan datos para iniciar sesión.');
        }
      },
      error: (err) => {
        const errorMessage =
          err.error?.message || 'Error desconocido al crear el usuario.';
        alert('Error al crear usuario: ' + errorMessage);
        console.error('Error al crear el usuario', err);
      },
    });
  }

  onFileChange(event: Event, type: string) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!['image/png'].includes(file.type)) {
        alert('Por favor, sube solo archivos en formato PNG.');
        return;
      }

      // Validar tamaño de archivo (5 MB como máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar los 5 MB.');
        return;
      }

      // Leer el archivo como Data URL para previsualización
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;

        // Actualizar la URL y el archivo correspondiente
        switch (type) {
          case 'logo':
            this.logoFileName = file.name;
            this.logoUrl = result;
            this.logoFile = file;
            break;
          case 'profileImage':
            this.profileImageFileName = file.name;
            this.profileImageFile = file;
            this.profileImageUrl = result;
            break;
          case 'cv':
            this.cvFileName = file.name;
            this.cvFile = file;
            this.cvUrl = result;
            break;
          default:
            console.warn(`Tipo desconocido: ${type}`);
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
