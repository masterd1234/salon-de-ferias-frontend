import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyDataService } from '../../services/company-data.service';
import { CompanyService } from '../../services/information.service';
import { ImageService } from '../../services/design.service';
import { Company } from '../../../models/company.model';
import { getSectorName, sectorsMap } from '../../../models/offers/sector.model';
import { getJobType, JobTypeMap } from '../../../models/offers/jobType.model';
import { Offer } from '../../../models/offers/offers.model';
import { MatIconModule } from '@angular/material/icon';
import { VideosComponent } from '../profile/videos/videos.component';
import { VideoService } from '../../services/videos.service';
import { OffersService } from '../../services/offers.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { catchError, lastValueFrom, Observable, of, retry, tap } from 'rxjs';

import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stand-company',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
  ],
  templateUrl: './stand-company.component.html',
  styleUrl: './stand-company.component.scss',
})
export class StandCompanyComponent implements OnInit {
  company: any = null;
  companyInfo: any = null;
  designData: any = {};
  // companyInfo = signal<Company | null>(null);

  offers: Offer[] = [];
  expandedOfferId: string | null = null;
  /** Lista de videos en formato seguro */
  videos: SafeResourceUrl[] = [];
  getJobType = getJobType;
  getSectorName = getSectorName;
  cols: number = 3;
  isSmallScreen: boolean = false;

  showFullText: boolean = false;
  truncatedDescription: string = '';
  fullDescription: string = '';
  showFullAdditionalInfo: boolean = false;
  truncatedAdditionalInfo: string = '';
  fullAdditionalInfo: string = '';

  /** Referencia al elemento canvas utilizado para la vista previa */
  @ViewChild('previewCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private sanitazer = inject(DomSanitizer);
  // private imagenService = inject(ImageService);

  constructor(
    private route: ActivatedRoute,
    private companyDataService: CompanyDataService,
    private companyService: CompanyService,
    private imagenService: ImageService,
    private videoService: VideoService,
    private offerService: OffersService,
    private location: Location,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const companyId = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la URL
    if (companyId) {
      this.companyDataService.getAllCompanies().subscribe({
        next: (response) => {
          this.company = response.companies.find((c) => c.id === companyId);
        },
        error: (err) => {
          console.error('Error al obtener los datos de la empresa:', err);
        },
      });
      this.imagenService.getDesign(companyId).subscribe({
        next: (response) => {
          this.designData = response.data ?? null;
          if (this.designData) {
            this.drawCanvas();
          }
        },
        error: (err) => {
          console.error('Error al obtener los datos del usuario:', err);
        },
      });
      this.companyService.getInformation(companyId).subscribe({
        next: (response) => {
          this.companyInfo = response.data;
        },
        error: (err) => {
          console.error('Error al obtener los datos del usuario:', err);
        },
      });
      this.videoService.getVideosByCompanyId(companyId).subscribe({
        next: (response) => {
          if (response.success && response.videos) {
            this.videos = response.videos
              .flatMap((video) =>
                video.urls
                  ? video.urls.map((url) =>
                      this.sanitazer.bypassSecurityTrustResourceUrl(
                        `https://www.youtube.com/embed/${url}`
                      )
                    )
                  : []
              )
              .filter((video): video is SafeResourceUrl => video !== null);
          } else {
            console.error('Error al obtener los videos:', response.message);
          }
        },
        error: (err) => {
          console.error('Error al obtener los videos de la empresa:', err);
        },
      });
      this.offerService.getOffersById(companyId).subscribe({
        next: (response) => {
          if (response.success && response.offers) {
            this.offers = response.offers; // Asigna la lista de ofertas a la propiedad
          } else {
            console.error('Error al obtener ofertas:', response.message);
          }
        },
        error: (err) => {
          console.error('Error al obtener los datos del usuario:', err);
        },
      });
    }
  }

  goBack(): void {
    this.location.back(); // 🔙 Regresa a la página anterior
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

  /**
   * Alterna el estado de visualización entre texto completo y truncado.
   */
  toggleText() {
    this.showFullText = !this.showFullText;
  }

  /**
   * Alterna entre mostrar texto completo o truncado en "Información Adicional".
   */
  toggleAdditionalInfo() {
    this.showFullAdditionalInfo = !this.showFullAdditionalInfo;
  }

  /** Configura el tamaño de pantalla como "pequeña" si el ancho es menor o igual a 768px. */
  checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      // Validamos si window está disponible
      this.isSmallScreen = window.innerWidth <= 768;
    } else {
      console.warn('El objeto `window` no está disponible.');
      this.isSmallScreen = false; // Establece un valor predeterminado si window no está disponible
    }
  }

  /**
   * Alterna la visualización de los detalles de una oferta.
   * @param offerId ID de la oferta.
   */
  toggleOfferDetails(offerId: string) {
    this.expandedOfferId = this.expandedOfferId === offerId ? null : offerId;
  }

  /**
   * @param html Cadena de HTML a truncar.
   * @param limit Límite de caracteres.
   * @returns Cadena truncada en HTML manteniendo etiquetas válidas.
   */
  truncateHTML(html: string, limit: number): string {
    const div = document.createElement('div');
    div.innerHTML = html;

    let truncated = '';
    let charCount = 0;

    function traverse(node: Node) {
      if (charCount >= limit) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (charCount + text.length > limit) {
          truncated += text.substring(0, limit - charCount) + '...';
          charCount = limit;
        } else {
          truncated += text;
          charCount += text.length;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        truncated += `<${element.tagName.toLowerCase()}${getAttributes(
          element
        )}>`;
        for (let i = 0; i < element.childNodes.length; i++) {
          traverse(element.childNodes[i]);
          if (charCount >= limit) break;
        }
        truncated += `</${element.tagName.toLowerCase()}>`;
      }
    }

    function getAttributes(element: HTMLElement): string {
      return Array.from(element.attributes)
        .map((attr) => ` ${attr.name}="${attr.value}"`)
        .join('');
    }

    traverse(div);
    return truncated;
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

    if (this.designData.stand.url) {
      const standImage = new Image();
      standImage.src = this.designData.stand.url;
      standImage.onload = () => {
        // Dibuja el stand como fondo
        this.drawImageContainStand(
          ctx,
          standImage,
          canvas.clientWidth,
          canvas.clientHeight
        );

        // Dibuja el logo, banner y póster, en este orden
        if (this.designData.design.logo.url) {
          this.drawLogo(ctx);
        }
        if (this.designData.files.banner) {
          this.drawBanner(ctx)
            .then(() => this.drawReceptionist(ctx)) // Dibuja recepcionista solo después del banner
            .catch((error) => console.error('Error al dibujar:', error));
        }
        if (this.designData.files.poster) {
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
      if (this.designData.files.banner) {
        const bannerImage = new Image();
        bannerImage.src = this.designData.files.banner;

        bannerImage.onload = () => {
          const canvas = ctx.canvas;

          // Escalar stand y obtener dimensiones reales en el canvas
          const standImage = new Image();
          standImage.src = this.designData.stand.url;

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
            const { x, y, width, height } = this.designData.stand.standConfig
              .bannerPosition || {
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
    if (this.designData.design.logo.url) {
      const logoImage = new Image();
      logoImage.src = this.designData.design.logo.url;

      logoImage.onload = () => {
        const canvas = ctx.canvas;

        // Escalar stand y obtener dimensiones reales en el canvas
        const standImage = new Image();
        standImage.src = this.designData.stand.url;

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
          const { x, y, width, height } = this.designData.stand.standConfig
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
      if (!this.designData.model.url || !this.designData.stand.standConfig) {
        resolve();
        return;
      }

      const receptionistImage = new Image();
      receptionistImage.src = this.designData.model.url;

      receptionistImage.onload = () => {
        const canvas = ctx.canvas;

        // Escalar stand y obtener dimensiones reales en el canvas
        const standImage = new Image();
        standImage.src = this.designData.stand.url;

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
          const { x, y, width, height } = this.designData.stand.standConfig
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

  applyToOffer(offer: any): void {
    this.offerService.applyToOffer(offer.id).subscribe({
      next: () => {
        this.snackBar.open('Inscripción exitosa', 'Cerrar', { duration: 3000 });

        if (offer.link) {
          // Redirige solo si la oferta tiene un enlace
          setTimeout(() => {
            window.open(offer.link, '_blank');
          }, 1000); // Pequeño retraso para que el usuario vea la confirmación
        }
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.error || 'Error al inscribirse',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }
}
