import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { UserService } from '../../services/users.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { CompanyService } from '../../services/information.service';
import { Company } from '../../../models/company.model';
import { VideosComponent } from './videos/videos.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VideoService } from '../../services/videos.service';
import { MatDialog } from '@angular/material/dialog';
import { Offer } from '../../../models/offers/offers.model';
import { OffersService } from '../../services/offers.service';
import { OffersComponent } from './offers/offers.component';
import { MatIconModule } from '@angular/material/icon';
import { EditFormComponent } from './edit-form/edit-form.component';
import { AuthService } from '../../services/auth.service';
import { getJobType, JobTypeMap } from '../../../models/offers/jobType.model';
import { getSectorName, sectorsMap } from '../../../models/offers/sector.model';
import { Usuario } from '../../../models/users.model';
import { catchError, lastValueFrom, Observable, of, retry, tap } from 'rxjs';
import { ImageService } from '../../services/design.service';
import { Router } from '@angular/router';

/**
 * @class ProfileComponent
 * @description La clase `ProfileComponent` es responsable de mostrar y gestionar el perfil de usuario,
 * incluyendo información de la empresa, videos asociados y ofertas. Es un componente independiente de Angular
 * diseñado para manejar características interactivas y responsivas.
 */
@Component({
  selector: 'app-profile',
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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  JobTypeMap = JobTypeMap;
  getJobType = getJobType;

  sectorsMap = sectorsMap;
  getSectorName = getSectorName;

  /** Variables de control para la visualización de texto completo o truncado en las descripciones */
  showFullText: boolean = false;
  truncatedDescription: string = '';
  fullDescription: string = '';
  showFullAdditionalInfo: boolean = false;
  truncatedAdditionalInfo: string = '';
  fullAdditionalInfo: string = '';

  logoFileName: string = '';
  logoFile: File | null = null; // Archivo cargado para el logo
  logoUrl: string | null = null;

  /** Lista de ofertas obtenidas del servicio de ofertas */
  offers: Offer[] = [];
  expandedOfferId: string | null = null;

  /** URL de un nuevo video ingresado por el usuario */
  newVideo: string = '';
  /** Lista de videos en formato seguro */
  videos: SafeResourceUrl[] = [];
  /** Signal para almacenar la lista de usuarios */
  users = signal<any[]>([]);
  /** Signal para almacenar los datos de la empresa */
  company = signal<Company | null>(null);

  /** URL de la imagen de perfil */
  profileImageUrl: string | null = null;
  /** Número de columnas para la cuadrícula, adaptable a tamaños de pantalla */
  cols: number = 3;
  /** Flag para indicar si la pantalla es pequeña */
  isSmallScreen: boolean = false;

  // Formulario reactivo para la URL del video
  videoForm: FormGroup;

  user: { name: string; rol: string } | null = null;

  userCompany: Usuario | null = null;

  designData: any = {};

  // Control de estado
  loading = signal<boolean>(true); // Para controlar si se está cargando
  loadingError = signal<boolean>(false); // Para manejar errores de carga
  drawModel = signal<boolean>(false);

  /** Referencia al elemento canvas utilizado para la vista previa */
  @ViewChild('previewCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Servicios inyectados necesarios para las operaciones de autenticación, empresa, videos y ofertas */
  private userService = inject(UserService);
  private companyService = inject(CompanyService);
  private sanitazer = inject(DomSanitizer);
  private videoService = inject(VideoService);
  private offerService = inject(OffersService);
  private imagenService = inject(ImageService);
  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * @constructor
   * Constructor de la clase `ProfileComponent`.
   * Inicializa la carga de ofertas, videos y datos de la empresa.
   * También configura una URL de imagen de perfil inicial.
   * @param dialog Servicio de diálogo de Angular Material para abrir diálogos.
   */
  constructor(public dialog: MatDialog, private fb: FormBuilder) {
    this.videoForm = this.fb.group({
      newVideo: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
          ),
        ],
      ],
    });
    this.profileImageUrl = '';
  }

  /**
   * Inicializa el componente verificando la autenticación.
   */
  ngOnInit(): void {
    this.loadProfileData();
  }
  /**
   * Carga los datos del perfil del usuario.
   */
  private async loadProfileData(): Promise<void> {
    this.loading.set(true);
    this.loadingError.set(false);

    try {
      await Promise.all([
        lastValueFrom(this.loadOffers()),
        lastValueFrom(this.loadVideos()),
        lastValueFrom(this.getUserCompany()),
        lastValueFrom(this.getCompanyData()),
        lastValueFrom(this.getDesignData()),
      ]);
    } catch (error) {
      console.error('Error al cargar los datos del perfil:', error);
      this.loadingError.set(true);
    } finally {
      this.loading.set(false);
    }
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

  getUserCompany(): Observable<Usuario | null> {
    return this.userService.getUserById().pipe(
      retry(3), // Reintenta la solicitud hasta 3 veces
      tap((response) => {
        this.userCompany = response ?? null;
      }),
      catchError((err) => {
        console.error('Error después de 3 reintentos:', err);
        return of(null); // Devuelve un Observable con `null` en caso de error
      })
    );
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
  /**
   * Obtiene los datos de la empresa desde el servicio `CompanyService`.
   * Establece las descripciones completas y truncadas para mostrar en el perfil.
   */
  getCompanyData(): Observable<any> {
    return this.companyService.getInformation().pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.company.set(response.data);
          this.fullDescription = response.data.description || '';
          this.truncatedDescription = this.truncateHTML(
            this.fullDescription,
            100
          );
          this.fullAdditionalInfo = response.data.additional_information || '';
          this.truncatedAdditionalInfo = this.truncateHTML(
            this.fullAdditionalInfo,
            100
          );
        } else {
          console.error(
            'Error al obtener la información de la empresa:',
            response.message
          );
        }
      }),
      catchError((error) => {
        console.error(
          'Error inesperado al obtener la información de la empresa:',
          error
        );
        return of(null); // Devuelve un observable nulo en caso de error
      })
    );
  }

  openEditDialog(): void {
    const companyData = this.company();
    if (!companyData) {
      console.error('No se pudieron cargar los datos de la empresa');
      return;
    } // Datos actuales de la empresa
    const formGroup = this.fb.group({
      description: [companyData?.description || '', Validators.required],
      additional_information: [companyData?.additional_information || ''],
      sector: [companyData?.sector || ''],
      additionalButtonTitle: [''], // Campo para título de enlace adicional
      additionalButtonLink: [''],
      links: this.fb.array(companyData?.links || []),
    });

    const dialogRef = this.dialog.open(EditFormComponent, {
      width: '500px',
      height: '90vh',
      data: { form: formGroup },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.saveCompanyData(result); // Guardar datos actualizados
      }
    });
  }

  saveCompanyData(companyData: Company): void {
    this.companyService.updateCompany(companyData).subscribe(() => {
      this.getCompanyData(); // Refrescar los datos
    });
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
   * @method isRol
   * @description Verifica el rol del usuario (admin o co) decodificando el token de autenticación.
   * @returns {string} Retorna `'admin'`, `'co'`, o una cadena vacía si no tiene un rol válido.
   */
  isRol(): string {
    this.user = this.authService.getUser();
    if (this.user) {
      return this.user.rol;
    } else return '';
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
   * Carga videos desde el backend y los sanitiza.
   */
  loadVideos(): Observable<any> {
    return this.videoService.getVideosByCompanyId().pipe(
      tap((response) => {
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
      }),
      catchError((error) => {
        console.error('Error inesperado al cargar los videos:', error);
        return of(null); // Devuelve un observable nulo en caso de error
      })
    );
  }

  /**
   * @param url URL del video de YouTube.
   * @returns ID del video o `null` si no es válido.
   */
  getYouTubeVideoId(url: string): string | null {
    const regExp =
      /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  /**
   * Agrega un nuevo video si la URL es válida.
   */
  addVideo() {
    if (this.videoForm.valid) {
      const videoId = this.getYouTubeVideoId(this.videoForm.value.newVideo);
      if (videoId) {
        this.videoService.addVideo(videoId).subscribe(
          () => {
            this.videos.push(
              this.sanitizeUrl(`https://www.youtube.com/embed/${videoId}`)
            );
            this.videoForm.reset();
          },
          (error) => {
            alert('Error al agregar el video.');
          }
        );
      } else {
        alert('URL de YouTube no válida');
      }
    }
  }

  /**
   * @param url URL del video.
   * @returns URL sanitizada segura para el recurso.
   */
  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitazer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Abre un diálogo para añadir un nuevo video.
   */
  openVideoDialog(): void {
    const dialogRef = this.dialog.open(VideosComponent, { width: '300px' });
    dialogRef.afterClosed().subscribe((videoUrl) => {
      if (videoUrl) this.addVideo();
    });
  }

  /** Cambia el número de columnas al redimensionar la pantalla y verifica el tamaño de la misma. */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setGridCols();
    this.checkScreenSize();
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

  /** Establece el número de columnas de la cuadrícula según el ancho de la ventana. */
  setGridCols() {
    if (typeof window !== 'undefined') {
      // Validamos si window está disponible
      const width = window.innerWidth;
      this.cols = width <= 480 ? 1 : width <= 768 ? 2 : 3;
    } else {
      console.warn('El objeto `window` no está disponible.');
      this.cols = 3; // Establece un valor predeterminado si window no está disponible
    }
  }
  /**
   * Carga las ofertas desde el backend.
   */
  loadOffers(): Observable<any> {
    return this.offerService.getOffersById().pipe(
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

  /**
   * Alterna la visualización de los detalles de una oferta.
   * @param offerId ID de la oferta.
   */
  toggleOfferDetails(offerId: string) {
    this.expandedOfferId = this.expandedOfferId === offerId ? null : offerId;
  }

  /**
   * Cierra los detalles de una oferta.
   * @param event Evento de clic.
   */
  closeOfferDetails(event: Event) {
    event.stopPropagation();
    this.expandedOfferId = null;
  }

  /**
   * Elimina una oferta del backend.
   * @param offerId ID de la oferta.
   */
  deleteOffer(offerId: string) {
    this.offerService.deleteOffer(offerId).subscribe(
      (response) => {
        console.log('Oferta eliminada:', response);
        this.loadOffers();
      },
      (error) => {
        console.error('Error al eliminar oferta:', error);
      }
    );
  }

  /**
   * Agrega una nueva oferta al backend.
   * @param offerData Datos de la oferta a agregar.
   */
  addOffer(offerData: Offer) {
    this.offerService.addOffer(offerData).subscribe(
      (response) => {
        console.log('Oferta añadida con éxito:', response);
        this.loadOffers();
      },
      (error) => {
        console.error('Error al agregar la oferta:', error);
      }
    );
  }

  /**
   * Abre un diálogo para añadir una nueva oferta.
   */
  openOfferDialog(): void {
    const dialogRef = this.dialog.open(OffersComponent, { width: 'auto' });
    dialogRef.afterClosed().subscribe((offerData) => {
      if (offerData) this.addOffer(offerData);
    });
  }

  onFileChange(event: Event, type: string) {
    const userId = this.userCompany?.id;
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
          // case 'profileImage':
          //   this.profileImageFileName = file.name;
          //   this.profileImageFile = file;
          //   this.profileImageUrl = result;
          //   break;

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
            // this.userCompany.logo = response.newLogoUrl;
          }
        },
        error: (err) => {
          console.error('Error al actualizar el logo:', err);
        },
      });
    }
  }
}
