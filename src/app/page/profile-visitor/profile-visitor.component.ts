import { Component, signal, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EditFormComponent } from './edit-form/edit-form.component';
import { UserDataService } from '../../services/user-data.service';
import { UserService } from '../../services/users.service';
import { Usuario } from '../../../models/users.model';
import { Company } from '../../../models/company.model';
import { catchError, lastValueFrom, Observable, of, retry, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-profile-visitor',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './profile-visitor.component.html',
  styleUrl: './profile-visitor.component.scss',
})
export class ProfileVisitorComponent {
  loading = signal<boolean>(true); // Para controlar si se está cargando
  loadingError = signal<boolean>(false); // Para manejar errores de carga

  userVisitor: Usuario | null = null;
  // userVisitor = signal<Usuario | null>(null);
  user = signal<Company | null>(null);

  // private userDataService = inject(UserDataService);
  private userService = inject(UserService);
  private router = inject(Router);

  constructor(public dialog: MatDialog, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  private async loadProfileData(): Promise<void> {
    this.loading.set(true);
    this.loadingError.set(false);

    try {
      await Promise.all([lastValueFrom(this.getUserVisitor())]);
    } catch (error) {
      console.error('Error al cargar los datos del perfil:', error);
      this.loadingError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  getUserVisitor(): Observable<Usuario | null> {
    return this.userService.getUserById().pipe(
      retry(3), // Reintenta la solicitud hasta 3 veces
      tap((response) => {
        this.userVisitor = response;
      }),
      catchError((err) => {
        console.error('Error después de 3 reintentos:', err);
        return of(null); // Devuelve un Observable con `null` en caso de error
      })
    );
  }

  /**
   * Desplaza la vista hacia la sección de información del perfil.
   */
  scrollToSection(sectionId: string) {
    this.router.navigate([], { fragment: sectionId }).then(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  openEditDialog(): void {
    const userData = this.userVisitor;
    if (!userData) {
      console.error('No se pudieron cargar los datos del visitante');
      return;
    } // Datos actuales de la empresa
    const formGroup = this.fb.group({
      name: [userData?.name || '', Validators.required],
      dni: [userData?.dni || ''],
      email: [userData?.email || ''],
      phone: [userData?.phone || ''],
    });

    const dialogRef = this.dialog.open(EditFormComponent, {
      width: '500px',
      height: '90vh',
      data: { form: formGroup },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveUserData(result); // Guardar datos actualizados
      }
    });
  }

  saveUserData(userData: Usuario): void {
    // this.companyService.updateCompany(companyData).subscribe(() => {
    //   this.getUserVisitor(); // Refrescar los datos
    // });
    this.userService.updateCompany(userData).subscribe(() => {
      console.log('userdata', userData);
      this.getUserVisitor(); // Refrescar los datos
    });
  }
}
