import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
//import { Usuario } from '../../models/usuario.model';
//import { UserService } from 'src/app/services/user.service'; // Ensure this path is correct

//import { EditDialogComponent } from '../admin-dashboard/edit-users/edit-dialog/edit-dialog.component'; // Ensure this path is correct
import { Observable, lastValueFrom, of } from 'rxjs';
import { retry, tap, catchError } from 'rxjs/operators';
import { signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/users.model';
import { UserService } from '../../services/users.service';
import { EditUsersComponent } from './edit-users/edit-users.component';

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
export class ProfileVisitorComponent implements OnInit {
  loading = signal<boolean>(true); // Para controlar si se está cargando
  loadingError = signal<boolean>(false); // Para manejar errores de carga

  userVisitor: WritableSignal<Usuario | null> = signal<Usuario | null>(null);
  //user = signal<Company | null>(null);

  // private userDataService = inject(UserDataService);
  private userService = inject(UserService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  // scrollToSection: any; // Removed duplicate identifier

  constructor() {}

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
    // const id: string = 'some-id'; // Replace 'some-id' with the actual id value
    return this.userService.getUserById().pipe(
      retry(3), // Reintenta la solicitud hasta 3 veces
      tap((response) => {
        const user = response as Usuario;
        this.userVisitor.set(user);
      }),
      catchError((err) => {
        console.error('Error después de 3 reintentos:', err);
        return of(null); // Devuelve un Observable con `null` en caso de error
      })
    );
  }

  openEditDialog(): void {
    const userData = this.userVisitor();
    if (!userData) {
      console.error('No se pudieron cargar los datos del visitante');
      return;
    }

    const formGroup = this.fb.group({
      name: [userData.name || '', Validators.required],
      dni: [userData.dni || ''],
      email: [userData.email || ''],
      phone: [userData.phone || ''],
      subname: [userData.name || ''],
    });

    const dialogRef = this.dialog.open(EditUsersComponent, {
      width: '500px',
      height: '90vh',
      data: { form: formGroup, userId: userData.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.saveUserData(result); // Guardar datos actualizados
      }
    });
  }

  /**
   * Desplaza la vista hacia la sección de información del perfil.
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  // private saveUserData(data: any): void {
  //   // Implementa la lógica para guardar los datos del usuario
  // }
}
