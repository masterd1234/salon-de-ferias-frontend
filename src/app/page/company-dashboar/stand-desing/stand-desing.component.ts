import { Component, OnInit, ViewChild, ElementRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../services/design.service';
import { CompanyService } from '../../../services/information.service';
import { ChangeDetectorRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { BannerComponent } from '../banner/banner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Stand } from '../../../../models/stand.model';
import { Models } from '../../../../models/models.model';
import { catchError, Observable, of, retry, tap } from 'rxjs';
import { Usuario } from '../../../../models/users.model';
import { UserService } from '../../../services/users.service';

/**
 * Componente `StandDesingComponent`
 * Permite a los usuarios seleccionar y personalizar el diseño de un stand
 * en una feria virtual, incluyendo la selección de una imagen de stand y una recepcionista.
 * Además, incluye una vista previa en tiempo real de las selecciones.
 */
@Component({
  templateUrl: './stand-desing.component.html',
  styleUrls: ['./stand-desing.component.scss'],
  selector: 'app-desing-root',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDividerModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    BannerComponent,
    MatIconModule,
    MatGridListModule],
})
export class StandDesingComponent implements OnInit {
  /** Referencia al elemento canvas utilizado para la vista previa */
  @ViewChild('previewCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Bandera para habilitar el envío de archivos */
  canSendFiles: boolean = false;

  /** Lista de imágenes de stands disponibles */
  standImages: string[] = [];

  /** Lista de imágenes de recepcionistas disponibles */
  receptionistImages: string[] = [];
  selectedStandId: string | null = null;
  currentReceptionistId: string | null = null;
  standConfigs: Stand[] = [];
  recepConfigs: Models[] = [];
  /** Imagen de stand seleccionada */
  selectedStand = signal<string | null>(null);

  /** Imagen de recepcionista seleccionada */
  selectedReceptionist = signal<string | null>(null);

  /** Configuración actual del stand seleccionada */
  currentStandConfig: any = null;

  /** URL de la imagen cargada */
  imageSrc: string | null = null;

  /** Bandera para verificar si una imagen ha sido cargada */
  imagenCargada: boolean = false;

  /** Imágenes cargadas */
  bannerImages: File | null = null;
  posterImages: File | null = null;
  logoImages: File | null = null;
  userCompany: Usuario | null = null;
  logoUrl: string | null = null;
  bannerUrl: string | null = null;

  /** Estado de arrastre */
  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  /**
   * Señal computada que indica si se pueden subir archivos,
   * en función de la selección de stand y recepcionista.
   * @returns {boolean} `true` si ambas selecciones están hechas, `false` de lo contrario.
   */
  canUploadFiles = computed(() => !!this.selectedStand() && !!this.selectedReceptionist());

  /**
   * Constructor de StandDesingComponent
   * @param imageService Servicio para obtener las imágenes de stands y recepcionistas.
   * @param companyService Servicio para enviar la selección de stand y recepcionista al backend.
   * @param cdr ChangeDetectorRef para gestionar cambios en la vista.
   */

  constructor(
    private imageService: ImageService,
    private companyService: CompanyService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.loadStands();
    this.loadModels();
    this.loadUserCompany();
  }

  loadStands(): void {
    this.imageService.getAllStands().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.standImages = response.data.map((stand: any) =>
            `https://backend-node-wpf9.onrender.com/proxy?url=${stand.url.fileUrl}`
          );
          this.standConfigs = response.data;
        } else {
          console.error('Error al cargar stands:', response.message);
        }
      },
      error: (err) => console.error('Error inesperado al cargar stands:', err),
    });
  }

  loadModels(): void {
    this.imageService.getAllModels().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.receptionistImages = response.data.map((model: any) =>
            `https://backend-node-wpf9.onrender.com/proxy?url=${model.url.fileUrl}`
          );
          this.recepConfigs = response.data;
        } else {
          console.error('Error al cargar modelos:', response.message);
        }
      },
      error: (err) => console.error('Error inesperado al cargar modelos:', err),
    });
  }

  loadUserCompany(): void {
    this.userService.getUserById().pipe(retry(3)).subscribe({
      next: (response) => {
        this.userCompany = response ?? null;
      },
      error: (err) => console.error('Error después de 3 reintentos:', err),
    });
  }

  selectStand(standUrl: string): void {
    const originalUrl = standUrl.replace('https://backend-node-wpf9.onrender.com/proxy?url=', '');
    const selectedStand = this.standConfigs.find((stand: any) => stand.url.fileUrl === originalUrl);

    if (selectedStand) {
      this.selectedStand.set(standUrl);
      this.currentStandConfig = selectedStand.standConfig || {};
      this.drawCanvas();
    } else {
      console.error('No se encontró el stand con la URL proporcionada.');
    }
  }

  selectReceptionist(receptionist: string): void {
    const originalUrl = receptionist.replace('https://backend-node-wpf9.onrender.com/proxy?url=', '');
    const selectedReceptionist = this.recepConfigs.find((model: any) => model.url.fileUrl === originalUrl);

    if (selectedReceptionist) {
      this.selectedReceptionist.set(receptionist);
      this.drawCanvas();
    } else {
      console.error('No se encontró la recepcionista con la URL proporcionada.');
    }
  }

  /**
 * Actualiza los archivos cargados desde el componente hijo.
 * @param files Objeto que contiene los archivos cargados (logo, banner, poster).
 */
  updateFiles(files: { banner: File | null, bannerUrl: string |null, poster: File | null }): void {
    // Puedes manejar los datos recibidos aquí
    if (files.banner) {
      this.bannerImages = files.banner;
      this.bannerUrl = files.bannerUrl;

      const selectedStand = this.selectedStand(); // Obtén el valor actual del signal
      if (selectedStand) {
        this.drawCanvas(); // Redibuja el canvas
      }
    }
    if (files.poster) {
      this.posterImages = files.poster;
    }

    // Llama a drawCanvas para actualizar el canvas
    this.drawCanvas();
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

    if (this.selectedStand()) {
      const standImage = new Image();
      standImage.src = this.selectedStand()!;
      standImage.onload = () => {
        // Dibuja el stand como fondo
        this.drawImageContainStand(ctx, standImage, canvas.clientWidth, canvas.clientHeight);

        // Dibuja el logo, banner y póster, en este orden
          this.drawLogo(ctx);

        if (this.bannerImages) {
          this.drawBanner(ctx);
        }
        if (this.posterImages) {
          this.drawPoster(ctx);
        }

        // Dibuja el recepcionista al final para que esté al frente
        this.drawReceptionist(ctx);
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
  drawBanner(ctx: CanvasRenderingContext2D) {
    if (this.bannerUrl) {
      const bannerImage = new Image();
      bannerImage.src = this.bannerUrl;

      bannerImage.onload = () => {
        const canvas = ctx.canvas;

        // Escalar stand y obtener dimensiones reales en el canvas
        const standImage = new Image();
        standImage.src = this.selectedStand()!;

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
          const { x, y, width, height } = this.currentStandConfig.bannerPosition || {
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

          // Dibuja el banner directamente sin clipping
          this.drawImageContain(ctx, bannerImage, bannerWidth, bannerHeight, bannerX, bannerY);
        };
      };
    }
  }

  /**
   * Dibuja el logo en el canvas.
   * @param ctx Contexto del canvas para renderizado.
   */
  drawLogo(ctx: CanvasRenderingContext2D) {
    if (this.userCompany?.logo) {
      const logoImage = new Image();
      logoImage.src = this.userCompany.logo;
      console.log('Url logo: ', logoImage.src);

      logoImage.onload = () => {
        const canvas = ctx.canvas;

        // Escalar stand y obtener dimensiones reales en el canvas
        const standImage = new Image();
        standImage.src = this.selectedStand()!;

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
          const { x, y, width, height } = this.currentStandConfig.logoPosition || {
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
          this.drawImageContain(ctx, logoImage, logoWidth, logoHeight, logoX, logoY);
        };
      };
    }
  }

  /**
   * Dibuja una imagen en el canvas utilizando el modo `object-fit: contain`.
   * @param ctx Contexto de renderizado del canvas.
   * @param image Imagen a dibujar.
   * @param canvasWidth Ancho del canvas.
   * @param canvasHeight Alto del canvas.
   */
  drawImageContain(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    targetWidth: number,
    targetHeight: number,
    targetX: number,
    targetY: number
  ): void {
    const scale = Math.min(targetWidth / image.width, targetHeight / image.height);
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
  drawImageContainStand(ctx: CanvasRenderingContext2D, image: HTMLImageElement, targetWidth: number, targetHeight: number): void {
    const scale = Math.min(targetWidth / image.width, targetHeight / image.height);
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
  drawReceptionist(ctx: CanvasRenderingContext2D): void {
    if (!this.selectedReceptionist() || !this.currentStandConfig) return;
    const receptionistImage = new Image();
    receptionistImage.src = this.selectedReceptionist()!;

    receptionistImage.onload = () => {
      const canvas = ctx.canvas;

      // Escalar stand y obtener dimensiones reales en el canvas
      const standImage = new Image();
      standImage.src = this.selectedStand()!;

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
        const { x, y, width, height } = this.currentStandConfig.recepcionistPosition || {
          x: 0.1,
          y: 0.1,
          width: 0.8,
          height: 0.3,
        };

        // Coordenadas absolutas del banner dentro del stand
        const recepcionistX = standX + x * standWidth;
        const recepcionistY = standY + y * standHeight;
        const recepcionistWidth = standWidth * width;
        const recepcionistHeight = standHeight * height;

        // Dibuja el banner directamente sin clipping
        this.drawImageContain(ctx, receptionistImage, recepcionistWidth, recepcionistHeight, recepcionistX, recepcionistY);
      };
    };
  }


  /**
   * Maneja el desplazamiento del carrusel de imágenes.
   * @param type Tipo de carrusel: 'stand' o 'receptionist'.
   * @param direction Dirección del desplazamiento: 'left' o 'right'.
   */
  scroll(type: 'stand' | 'receptionist', direction: 'left' | 'right') {
    const container = document.querySelector(
      type === 'stand' ? '.stand-carousel' : '.receptionist-carousel'
    ) as HTMLElement;

    if (container) {
      const scrollAmount = container.offsetWidth / 2; // Desplazamiento dinámico (mitad del contenedor)
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }

  /**
   * Envía la selección actual de stand y recepcionista al backend.
   */
  submitSelection(): void {
    const standID = this.selectedStandId;
    const modelID = this.currentReceptionistId;

    if (!standID) {
      alert('Debes seleccionar un Stand.');
      return;
    }
    if (!modelID) {
      alert('Debes seleccionar un Recepcionista.');
      return;
    }

    const formData = new FormData();
    formData.append('standID', standID);
    formData.append('modelID', modelID);

    if (this.bannerImages) {
      formData.append('banner', this.bannerImages);
    }
    if (this.posterImages) {
      formData.append('poster', this.posterImages);
    }
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    this.imageService.addDesign(formData).subscribe(
      (response) => {
        console.log(response);
        alert('Selección y archivos enviados correctamente');
      },
      (error) => {
        console.error('Error al enviar la selección y archivos:', error);
        alert('Hubo un error al enviar la selección y archivos');
      }
    );
  }

  /**
   * Limpia la selección actual de stands y recepcionistas.
   */
  clearSelection(): void {
    this.selectedStand.set(null);
    this.selectedReceptionist.set(null);
    this.imageSrc = null;
    this.imagenCargada = false;

    // Limpia el contenido del canvas
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.cdr.detectChanges();
  }

  /**
 * Habilita el arrastre en el carrusel.
 * @param event Evento de ratón o toque.
 */
  enableDrag(event: MouseEvent | TouchEvent): void {
    const container = (event.target as HTMLElement).closest('.images-container') as HTMLElement;
    if (!container) return;

    this.isDragging = true;
    this.startX = (event instanceof MouseEvent ? event.pageX : event.touches[0].pageX) - container.offsetLeft;
    this.scrollLeft = container.scrollLeft;
  }

  /**
   * Desplaza el carrusel durante el arrastre.
   * @param event Evento de ratón o toque.
   */
  drag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    const container = (event.target as HTMLElement).closest('.images-container') as HTMLElement;
    if (!container) return;

    event.preventDefault();
    const x = (event instanceof MouseEvent ? event.pageX : event.touches[0].pageX) - container.offsetLeft;
    const walk = (x - this.startX) * 2; // Multiplica por 2 para mayor sensibilidad
    container.scrollLeft = this.scrollLeft - walk;
  }

  /**
   * Deshabilita el arrastre.
   */
  disableDrag(): void {
    this.isDragging = false;
  }
}
