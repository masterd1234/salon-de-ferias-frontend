import { Component, signal, inject } from '@angular/core';
import { UserDataService } from '../../services/user-data.service';
import { UserService } from '../../services/users.service';
import { Usuario } from '../../../models/users.model';
import { catchError, lastValueFrom, Observable, of, retry, tap } from 'rxjs';

@Component({
  selector: 'app-profile-visitor',
  standalone: true,
  imports: [],
  templateUrl: './profile-visitor.component.html',
  styleUrl: './profile-visitor.component.scss',
})
export class ProfileVisitorComponent {
  loading = signal<boolean>(true); // Para controlar si se está cargando
  loadingError = signal<boolean>(false); // Para manejar errores de carga

  userVisitor: Usuario | null = null;

  private userDataService = inject(UserDataService);
  // private userService = inject(UserService);

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
    return this.userDataService.getUserById().pipe(
      retry(3), // Reintenta la solicitud hasta 3 veces
      tap((response) => {
        this.userVisitor = response ?? null;
      }),
      catchError((err) => {
        console.error('Error después de 3 reintentos:', err);
        return of(null); // Devuelve un Observable con `null` en caso de error
      })
    );
  }
}
