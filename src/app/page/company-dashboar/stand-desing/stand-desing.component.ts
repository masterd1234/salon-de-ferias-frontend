import { Component, OnInit, ViewChild, ElementRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../services/imagen.service';
import { CompanyService } from '../../../services/company.service';
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
  imports: [MatFormFieldModule, MatDividerModule, MatCardModule, MatInputModule, MatSelectModule, CommonModule, ReactiveFormsModule, BannerComponent, MatIconModule, MatGridListModule],
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
  bannerImages: string | null = null;
  posterImages: string | null = null;
  logoImages: string | null = null;

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
    private cdr: ChangeDetectorRef
  ) { }

  /** Método del ciclo de vida `OnInit` para inicializar datos */
  ngOnInit(): void {
    this.standImages = this.imageService.getStand(); // Obtiene las rutas de imágenes de stands
    this.receptionistImages = this.imageService.getReceptionist(); // Obtiene las rutas de imágenes de recepcionistas
  }

  /**
   * Método para seleccionar un stand.
   * @param stand URL de la imagen del stand seleccionada.
   */
  selectStand(stand: string): void {
    this.selectedStand.set(stand);
    this.currentStandConfig = this.imageService.getStandConfig(stand) || {};
    this.drawCanvas();
  }

  /**
   * Método para seleccionar una recepcionista.
   * @param receptionist URL de la imagen de la recepcionista seleccionada.
   */
  selectReceptionist(receptionist: string): void {
    this.selectedReceptionist.set(receptionist);
    this.drawCanvas();
  }

  /**
 * Actualiza los archivos cargados desde el componente hijo.
 * @param files Objeto que contiene los archivos cargados (logo, banner, poster).
 */
  updateFiles(files: { logo: string | null, banner: string | null, poster: string | null }) {
    // Puedes manejar los datos recibidos aquí
    if (files.logo) {
      this.logoImages = files.logo;
    }
    if (files.banner) {
      this.bannerImages = files.banner;

      const selectedStand = this.selectedStand(); // Obtén el valor actual del signal
      if (selectedStand) {
        // Asegúrate de que el stand seleccionado no sea null
        this.currentStandConfig = this.imageService.getStandConfig(selectedStand) || {};
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
        if (this.logoImages) {
          this.drawLogo(ctx);
        }
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
    if (this.bannerImages) {
      const bannerImage = new Image();
      bannerImage.src = this.bannerImages;

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
    if (this.logoImages) {
      const logoImage = new Image();
      logoImage.src = this.logoImages;

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

        const standWidth = standImage.width * scale;
        const standHeight = standImage.height * scale;
        const standX = (canvas.clientWidth - standWidth) / 2;
        const standY = (canvas.clientHeight - standHeight) / 2;

        const { x, y } = this.currentStandConfig.receptionistPosition || { x: 0, y: 0 };
        const scaleReceptionist = this.currentStandConfig.receptionistScale || 0.1;

        const recX = standX + x * standWidth;
        const recY = standY + y * standHeight;

        const recWidth = standWidth * scaleReceptionist;
        const recHeight = (receptionistImage.height / receptionistImage.width) * recWidth;

        // Dibuja el recepcionista por encima de todo
        ctx.globalAlpha = 1; // Asegúrate de que no haya transparencia
        ctx.drawImage(receptionistImage, recX, recY, recWidth, recHeight);
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
    const URLStand = this.selectedStand();
    const URLRecep = this.selectedReceptionist();

    if (!URLStand) {
      alert('Debes seleccionar un Stand.');
      return;
    }
    if (!URLRecep) {
      alert('Debes seleccionar un Recepcionista.');
      return;
    }
    this.canSendFiles = true;
    const selection = { URLStand, URLRecep };
    this.companyService.addStanAndRecep(selection).subscribe(
      (response) => {
        console.log('Datos enviados exitosamente:', response);
        alert('Selección enviada correctamente');
      },
      (error) => {
        console.error('Error al enviar la selección:', error);
        alert('Hubo un error al enviar la selección');
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
