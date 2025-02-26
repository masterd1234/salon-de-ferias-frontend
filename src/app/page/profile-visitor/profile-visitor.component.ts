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
import { Offer } from '../../../models/offers/offers.model';
import { UserService } from '../../services/users.service';
import { OffersService } from '../../services/offers.service';
import { EditUsersComponent } from './edit-users/edit-users.component';
import { getJobType, JobTypeMap } from '../../../models/offers/jobType.model';
import { getSectorName, sectorsMap } from '../../../models/offers/sector.model';

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
  JobTypeMap = JobTypeMap;
  getJobType = getJobType;

  sectorsMap = sectorsMap;
  getSectorName = getSectorName;

  loading = signal<boolean>(true); // Para controlar si se está cargando
  loadingError = signal<boolean>(false); // Para manejar errores de carga

  /** Lista de ofertas obtenidas del servicio de ofertas */
  offers: Offer[] = [];
  expandedOfferId: string | null = null;

  userVisitor: WritableSignal<Usuario | null> = signal<Usuario | null>(null);
  //user = signal<Company | null>(null);

  logoFileName: string = '';
  logoFile: File | null = null; // Archivo cargado para el logo
  // logoUrl: string | null = null;

  get logoUrl(): string {
    return this.userVisitor()?.logo || 'assets/logo_FM.png';
  }

  profileImageFile: File | null = null; // Archivo cargado para el banner
  profileImageFileName: string = '';
  profileImageUrl: string | null = null;

  // private userDataService = inject(UserDataService);
  private userService = inject(UserService);
  private offerService = inject(OffersService);
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
      await Promise.all([
        lastValueFrom(this.getUserVisitor()),
        lastValueFrom(this.loadOffers()),
      ]);
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

  /**
   * Carga las ofertas desde el backend.
   */
  loadOffers(): Observable<any> {
    // const userId = this.userVisitor()?.id;
    return this.offerService.getOffersUserById().pipe(
      tap((response) => {
        if (response.success && response.offers) {
          this.offers = response.offers; // Asigna la lista de ofertas a la propiedad
        } else {
          console.error('Error al obtener ofertas:', response.message);
        }
      }),
      catchError((error) => {
        console.error('Error inesperado al obtener ofertas:', error);
        return of(null); // Devuelve un observable nulo en caso de error
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
      height: '52vh',
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

  onFileChange(event: Event, type: string) {
    const userId = this.userVisitor()?.id;
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
          // case 'logo':
          //   this.logoFileName = file.name;
          //   this.logoUrl = result;
          //   this.logoFile = file;
          //   break;
          case 'profileImage':
            this.profileImageFileName = file.name;
            this.profileImageFile = file;
            this.profileImageUrl = result;
            break;

          default:
            console.warn(`Tipo desconocido: ${type}`);
        }
      };
      reader.readAsDataURL(file);

      // Verifica si tienes el ID del usuario
      if (!userId) {
        console.error('No se encontró el ID del usuario');
        return;
      }

      // Crea el objeto FormData y agrega el archivo
      const formData = new FormData();
      formData.append('logo', file); // El nombre del campo debe coincidir con el del backend

      // Llama al servicio para actualizar el logo
      this.userService.updateLogo(formData, userId).subscribe({
        next: (response) => {
          if (response && response.newLogoUrl) {
            console.log('Logo actualizado con éxito:', response.newLogoUrl);
            this.userVisitor.set({
              ...this.userVisitor()!,
              logo: response.newLogoUrl,
            });
          }
        },
        error: (err) => {
          console.error('Error al actualizar el logo:', err);
        },
      });
    }
  }

  /**
   * Alterna la visualización de los detalles de una oferta.
   * @param offerId ID de la oferta.
   */
  toggleOfferDetails(offerId: string) {
    this.expandedOfferId = this.expandedOfferId === offerId ? null : offerId;
  }
}
