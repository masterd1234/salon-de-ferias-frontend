import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { catchError, lastValueFrom, Observable, of, retry, tap } from 'rxjs';
import { ImageService } from '../../services/design.service';
import { UserService } from '../../services/users.service';
import { Usuario } from '../../../models/users.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-home-company',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatGridListModule],
  templateUrl: './home-company.component.html',
  styleUrl: './home-company.component.scss',
})
export class HomeCompanyComponent {
  designData: any = {};
  userCompany: Usuario | null = null;

  // Control de estado
  loading = signal<boolean>(true); // Para controlar si se está cargando
  loadingError = signal<boolean>(false); // Para manejar errores de carga

  /** Referencia al elemento canvas utilizado para la vista previa */
  @ViewChild('previewCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private imagenService = inject(ImageService);
  private userService = inject(UserService);
  private router = inject(Router);

  /**
   * Inicializa el componente verificando la autenticación.
   */
  ngOnInit(): void {
    this.loadProfileData();
  }

  private async loadProfileData(): Promise<void> {
    this.loading.set(true);
    this.loadingError.set(false);

    try {
      await Promise.all([lastValueFrom(this.getDesignData())]);
    } catch (error) {
      console.error('Error al cargar los datos del perfil:', error);
      this.loadingError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  getUserCompany(): Observable<Usuario | null> {
    return this.userService.getUserById().pipe(
      retry(3), // Reintenta la solicitud hasta 3 veces
      tap((response) => {
        this.userCompany = response ?? null;

        if (this.userCompany) {
          console.log('Company data cargado: ', this.userCompany);
        }
      }),
      catchError((err) => {
        console.error('Error después de 3 reintentos:', err);
        return of(null); // Devuelve un Observable con `null` en caso de error
      })
    );
  }

  getDesignData(): Observable<any> {
    return this.imagenService.getDesign().pipe(
      tap((response) => {
        this.designData = response ?? null;

        if (this.designData) {
          console.log('Design data cargado: ', this.designData.data);
          this.drawCanvas();
        }
      }),
      catchError((error) => {
        console.error('Error al obtener datos de diseño:', error);
        this.loadingError.set(true);
        return of(null);
      })
    );
  }

  /**
   * Dibuja el canvas de vista previa con las selecciones actuales.
   */
  drawCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas');
      return;
    }

    // Configura las dimensiones internas del canvas para alta resolución
    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = canvas.clientWidth * devicePixelRatio;
    const canvasHeight = canvas.clientHeight * devicePixelRatio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // Verifica si hay datos de diseño disponibles
    if (!this.designData) {
      console.error('No hay datos de diseño disponibles');
      return;
    }

    if (this.designData.data.stand.url) {
      const standImage = new Image();
      standImage.src = this.designData.data.stand.url;
      standImage.onload = () => {
        // Dibuja el stand como fondo
        this.drawImageContainStand(
          ctx,
          standImage,
          canvas.clientWidth,
          canvas.clientHeight
        );

        // Dibuja el logo, banner y póster, en este orden
        if (this.designData.data.design.logo.url) {
          this.drawLogo(ctx);
        }
        if (this.designData.data.files.banner) {
          this.drawBanner(ctx)
            .then(() => this.drawReceptionist(ctx)) // Dibuja recepcionista solo después del banner
            .catch((error) => console.error('Error al dibujar:', error));
        }
        if (this.designData.data.files.poster) {
          this.drawPoster(ctx);
        }
      };
    }
  }

  /**
   * Dibuja el poster en el canvas.
   * @param ctx Contexto del canvas para renderizado.
   */
  drawPoster(ctx: CanvasRenderingContext2D) {
    throw new Error('Method not implemented.');
  }
  /**
   * Dibuja el banner en el canvas.
   * @param ctx Contexto del canvas para renderizado.
   */
  drawBanner(ctx: CanvasRenderingContext2D): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.designData.data.files.banner) {
        const bannerImage = new Image();
        bannerImage.src = this.designData.data.files.banner;

        bannerImage.onload = () => {
          const canvas = ctx.canvas;

          // Escalar stand y obtener dimensiones reales en el canvas
          const standImage = new Image();
          standImage.src = this.designData.data.stand.url;

          standImage.onload = () => {
            const scale = Math.min(
              canvas.clientWidth / standImage.width,
              canvas.clientHeight / standImage.height
            );

            // Tamaño y posición real del stand en el canvas
            const standWidth = standImage.width * scale;
            const standHeight = standImage.height * scale;
            const standX = (canvas.clientWidth - standWidth) / 2; // Centrado horizontal
            const standY = (canvas.clientHeight - standHeight) / 2; // Centrado vertical

            // Coordenadas relativas del banner
            const { x, y, width, height } = this.designData.data.stand
              .standConfig.bannerPosition || {
              x: 0.1,
              y: 0.1,
              width: 0.8,
              height: 0.3,
            };

            // Coordenadas absolutas del banner dentro del stand
            const bannerX = standX + x * standWidth;
            const bannerY = standY + y * standHeight;
            const bannerWidth = standWidth * width;
            const bannerHeight = standHeight * height;

            // Dibuja el banner
            this.drawImageContain(
              ctx,
              bannerImage,
              bannerWidth,
              bannerHeight,
              bannerX,
              bannerY
            );
            resolve();
          };

          standImage.onerror = () =>
            reject('Error al cargar la imagen del stand');
        };

        bannerImage.onerror = () =>
          reject('Error al cargar la imagen del banner');
      } else {
        resolve(); // Si no hay banner, simplemente pasa
      }
    });
  }

  /**
   * Dibuja el logo en el canvas.
   * @param ctx Contexto del canvas para renderizado.
   */
  drawLogo(ctx: CanvasRenderingContext2D) {
    if (this.designData.data.design.logo.url) {
      const logoImage = new Image();
      logoImage.src = this.designData.data.design.logo.url;

      logoImage.onload = () => {
        const canvas = ctx.canvas;

        // Escalar stand y obtener dimensiones reales en el canvas
        const standImage = new Image();
        standImage.src = this.designData.data.stand.url;

        standImage.onload = () => {
          const scale = Math.min(
            canvas.clientWidth / standImage.width,
            canvas.clientHeight / standImage.height
          );

          // Tamaño y posición real del stand en el canvas
          const standWidth = standImage.width * scale;
          const standHeight = standImage.height * scale;
          const standX = (canvas.clientWidth - standWidth) / 2; // Centrado horizontal
          const standY = (canvas.clientHeight - standHeight) / 2; // Centrado vertical

          // Coordenadas relativas del logo
          const { x, y, width, height } = this.designData.data.stand.standConfig
            .logoPosition || {
            x: 0.1,
            y: 0.1,
            width: 0.8,
            height: 0.3,
          };

          // Coordenadas absolutas del logo dentro del stand
          const logoX = standX + x * standWidth;
          const logoY = standY + y * standHeight;
          const logoWidth = standWidth * width;
          const logoHeight = standHeight * height;

          // Dibuja el logo directamente sin clipping
          this.drawImageContain(
            ctx,
            logoImage,
            logoWidth,
            logoHeight,
            logoX,
            logoY
          );
        };
      };
    }
  }

  drawImageContain(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    targetWidth: number,
    targetHeight: number,
    targetX: number,
    targetY: number
  ): void {
    const scale = Math.min(
      targetWidth / image.width,
      targetHeight / image.height
    );
    const width = image.width * scale;
    const height = image.height * scale;
    const x = targetX + (targetWidth - width) / 2;
    const y = targetY + (targetHeight - height) / 2;

    ctx.drawImage(image, x, y, width, height);
  }

  /**
   * Dibuja la imagen del stand ajustada al canvas.
   * @param ctx Contexto del canvas.
   * @param image Imagen del stand.
   * @param targetWidth Ancho del canvas.
   * @param targetHeight Alto del canvas.
   */
  drawImageContainStand(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ): void {
    const scale = Math.min(
      targetWidth / image.width,
      targetHeight / image.height
    );
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (targetWidth - width) / 2;
    const y = (targetHeight - height) / 2;

    ctx.drawImage(image, x, y, width, height);
  }

  /**
   * Dibuja la imagen de la recepcionista en el canvas.
   * @param ctx Contexto de renderizado del canvas.
   */
  drawReceptionist(ctx: CanvasRenderingContext2D): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        !this.designData.data.model.url ||
        !this.designData.data.stand.standConfig
      ) {
        resolve();
        return;
      }

      const receptionistImage = new Image();
      receptionistImage.src = this.designData.data.model.url;

      receptionistImage.onload = () => {
        const canvas = ctx.canvas;

        // Escalar stand y obtener dimensiones reales en el canvas
        const standImage = new Image();
        standImage.src = this.designData.data.stand.url;

        standImage.onload = () => {
          const scale = Math.min(
            canvas.clientWidth / standImage.width,
            canvas.clientHeight / standImage.height
          );

          // Tamaño y posición real del stand en el canvas
          const standWidth = standImage.width * scale;
          const standHeight = standImage.height * scale;
          const standX = (canvas.clientWidth - standWidth) / 2; // Centrado horizontal
          const standY = (canvas.clientHeight - standHeight) / 2; // Centrado vertical

          // Coordenadas relativas del recepcionista
          const { x, y, width, height } = this.designData.data.stand.standConfig
            .recepcionistPosition || {
            x: 0.1,
            y: 0.1,
            width: 0.8,
            height: 0.3,
          };

          // Coordenadas absolutas del recepcionista dentro del stand
          const recepcionistX = standX + x * standWidth;
          const recepcionistY = standY + y * standHeight;
          const recepcionistWidth = standWidth * width;
          const recepcionistHeight = standHeight * height;

          // Dibuja el recepcionista
          this.drawImageContain(
            ctx,
            receptionistImage,
            recepcionistWidth,
            recepcionistHeight,
            recepcionistX,
            recepcionistY
          );
          resolve();
        };

        standImage.onerror = () =>
          reject('Error al cargar la imagen del stand');
      };

      receptionistImage.onerror = () =>
        reject('Error al cargar la imagen del recepcionista');
    });
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
}
