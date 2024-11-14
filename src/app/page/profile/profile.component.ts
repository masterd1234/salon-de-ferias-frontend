import { CommonModule } from '@angular/common';
import { Component, inject, signal, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../../models/company.model';
import { VideosComponent } from "./videos/videos.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VideoService } from '../../services/videos.service';
import { MatDialog } from '@angular/material/dialog';
import { Offer } from '../../../models/offers.model';
import { OffersService } from '../../services/offers.service';
import { OffersComponent } from './offers/offers.component';
import { MatIconModule } from '@angular/material/icon';
import { EditFormComponent } from './edit-form/edit-form.component';

/**
 * @class ProfileComponent
 * @description La clase `ProfileComponent` es responsable de mostrar y gestionar el perfil de usuario,
 * incluyendo información de la empresa, videos asociados y ofertas. Es un componente independiente de Angular
 * diseñado para manejar características interactivas y responsivas.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatButtonModule, MatCardModule, MatGridListModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  /** Mapa que asocia códigos de sectores con nombres descriptivos en español */
  sectorsMap: { [key: string]: string } = {
    tic: 'Tecnología de la Información y la Comunicación (TIC)',
    finanzas: 'Finanzas y Banca',
    salud: 'Salud y Farmacéutica',
    energia: 'Energía y Servicios Públicos',
    manufactura: 'Manufactura',
    automotriz: 'Automotriz',
    alimentacion: 'Alimentación y Bebidas',
    construccion: 'Construcción e Infraestructura',
    transporte: 'Transporte y Logística',
    aeronautica: 'Aeronáutica y Espacio',
    turismo: 'Turismo y Hotelería',
    educacion: 'Educación y Formación',
    agricultura: 'Agricultura y Agroindustria',
    biotecnologia: 'Biotecnología',
    retail: 'Comercio Minorista (Retail)',
    seguros: 'Seguros',
    medios: 'Medios de Comunicación y Entretenimiento',
    consultoria: 'Consultoría y Servicios Profesionales',
    inmobiliario: 'Inmobiliario y Construcción',
    quimica: 'Química e Industria Petroquímica',
    rrhh: 'Recursos Humanos',
    moda: 'Moda y Textil',
    ecommerce: 'E-commerce',
    arte: 'Arte y Cultura',
    deportes: 'Deportes y Ocio',
    medioambiente: 'Medio Ambiente y Sostenibilidad',
    legales: 'Servicios Legales',
    investigacion: 'Investigación y Desarrollo (I+D)',
    maritimo: 'Transporte Marítimo y Naval'
  };

  /** Variables de control para la visualización de texto completo o truncado en las descripciones */
  showFullText: boolean = false;
  truncatedDescription: string = '';
  fullDescription: string = '';
  showFullAdditionalInfo: boolean = false;
  truncatedAdditionalInfo: string = '';
  fullAdditionalInfo: string = '';

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

  /** Servicios inyectados necesarios para las operaciones de autenticación, empresa, videos y ofertas */
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private sanitazer = inject(DomSanitizer);
  private videoService = inject(VideoService);
  private offerService = inject(OffersService);

  /**
   * @constructor
   * Constructor de la clase `ProfileComponent`.
   * Inicializa la carga de ofertas, videos y datos de la empresa.
   * También configura una URL de imagen de perfil inicial.
   * @param dialog Servicio de diálogo de Angular Material para abrir diálogos.
   */
  constructor(public dialog: MatDialog, private fb: FormBuilder) {
    this.videoForm = this.fb.group({
      newVideo: ['', [Validators.required, Validators.pattern(/^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)]]
    });
    this.loadOffers();
    this.loadVideos();
    this.getCompanyData();
    this.profileImageUrl = '';
  }

  /**
   * Inicializa el componente y configura columnas responsivas y el tamaño de pantalla.
   */
  ngOnInit():void{
    this.loadOffers();
    this.loadVideos();
    this.setGridCols();
    this.checkScreenSize();
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
   * @param code Código del sector.
   * @returns El nombre completo del sector en español.
   */
  getSectorName(code: string | undefined): string {
    return this.sectorsMap[code || ''] || 'Sector no definido';
  }

  /**
   * Obtiene los datos de la empresa desde el servicio `CompanyService`.
   * Establece las descripciones completas y truncadas para mostrar en el perfil.
   */
  getCompanyData() {
    this.companyService.getCompany().subscribe({
      next: (data) => {
        this.company.set(data);
        this.fullDescription = data.description || '';
        this.truncatedDescription = this.truncateHTML(this.fullDescription, 100);
        this.fullAdditionalInfo = data.additional_information || '';
        this.truncatedAdditionalInfo = this.truncateHTML(this.fullAdditionalInfo, 100);
      },
      error: (error) => console.error('Error al obtener la información de la empresa', error)
    });
  }

  openEditDialog(): void {
    const companyData = this.company();
    if (!companyData) {
      console.error('No se pudieron cargar los datos de la empresa');
      return;
    } // Datos actuales de la empresa
    const formGroup = this.fb.group({
      name: [companyData?.name || '', Validators.required],
      description: [companyData?.description || '', Validators.required],
      additional_information: [companyData?.additional_information || ''],
      email: [companyData?.email || '', Validators.email],
      sector: [companyData?.sector || ''],
      additionalButtonTitle: [''], // Campo para título de enlace adicional
        additionalButtonLink: [''],
      links: this.fb.array(companyData?.link || []),
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
    const div = document.createElement("div");
    div.innerHTML = html;

    let truncated = "";
    let charCount = 0;

    function traverse(node: Node) {
      if (charCount >= limit) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (charCount + text.length > limit) {
          truncated += text.substring(0, limit - charCount) + "...";
          charCount = limit;
        } else {
          truncated += text;
          charCount += text.length;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        truncated += `<${element.tagName.toLowerCase()}${getAttributes(element)}>`;
        for (let i = 0; i < element.childNodes.length; i++) {
          traverse(element.childNodes[i]);
          if (charCount >= limit) break;
        }
        truncated += `</${element.tagName.toLowerCase()}>`;
      }
    }

    function getAttributes(element: HTMLElement): string {
      return Array.from(element.attributes)
        .map(attr => ` ${attr.name}="${attr.value}"`)
        .join("");
    }

    traverse(div);
    return truncated;
  }

  /**
   * @returns El rol del usuario ('admin', 'co' o una cadena vacía).
   */
  isRol(): string {
    const tokenData = this.authService.decodeToken();
    return tokenData?.rol === 'admin' ? 'admin' : tokenData?.rol === 'co' ? 'co' : '';
  }

  /**
   * Desplaza la vista hacia la sección de información del perfil.
   */
  scrollToSection() {
    const section = document.getElementById('informacion-section');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Carga videos desde el backend y los sanitiza.
   */
  loadVideos() {
    this.videoService.getVideos().subscribe(data => {
      this.videos = data.map(video => video.url 
        ? this.sanitazer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${video.url}`) 
        : null).filter((video): video is SafeResourceUrl => video !== null);
    });
  }

  /**
   * @param url URL del video de YouTube.
   * @returns ID del video o `null` si no es válido.
   */
  getYouTubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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
        this.videoService.addVideo(videoId).subscribe(() => {
          this.videos.push(this.sanitizeUrl(`https://www.youtube.com/embed/${videoId}`));
          this.videoForm.reset();
        }, error => {
          alert('Error al agregar el video.');
        });
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
    dialogRef.afterClosed().subscribe(videoUrl => {
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
    this.isSmallScreen = window.innerWidth <= 768;
  }

  /** Establece el número de columnas de la cuadrícula según el ancho de la ventana. */
  setGridCols() {
    const width = window.innerWidth;
    this.cols = width <= 480 ? 1 : width <= 768 ? 2 : 3;
  }

  /**
   * Carga las ofertas desde el backend.
   */
  loadOffers(){
    this.offerService.getOffersById().subscribe(
      (data) => {
        this.offers = data;
      },
      (error) => {
        console.error('Error al obtener ofertas:', error);
      }
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
    this.offerService.deleterOffer(offerId).subscribe(
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
    const dialogRef = this.dialog.open(OffersComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(offerData => {
      if (offerData) this.addOffer(offerData);
    });
  }
}
