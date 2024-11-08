import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

/**
 * Componente `BannerComponent` para gestionar la carga y visualización de archivos de imagen 
 * (logo, banner y póster) con opciones de ajuste de imagen y previsualización.
 */
@Component({
  selector: 'app-banner-root',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
  standalone: true,
  imports: [CommonModule, MatDividerModule, ReactiveFormsModule, MatCardModule, MatSliderModule, MatFormFieldModule, FormsModule]
})
export class BannerComponent {
  /** Indica si el usuario tiene permiso para subir archivos */
  @Input() canUploadFiles: boolean = false;

  /** Formulario reactivo para gestionar el banner */
  formBanner!: FormGroup;

  /** URL de previsualización del banner cargado */
  bannerUrl: string | null = null;

  /** URL de previsualización del póster cargado */
  posterUrl: string | null = null;

  /** URL de previsualización del logo cargado */
  logoUrl: string | null = null;

  /** Transformación de escala aplicada al logo */
  logoTransform: string = 'scale(1)';

  /** Factor de zoom para ajustar el tamaño del logo */
  zoom: number = 1;

  /** Posición del logo en el contenedor */
  logoPosition = { x: 0, y: 0 };

  /** Indica si la pantalla es pequeña (true) o grande (false) */
  isSmallScreen: boolean = false;

  /** Controla la visibilidad del contenido del formulario */
  isContentVisible: boolean = false;

  /** Nombre del archivo de logo cargado */
  logoFileName: string = '';

  /** Nombre del archivo de banner cargado */
  bannerFileName: string = '';

  /** Nombre del archivo de póster cargado */
  posterFileName: string = '';

  /**
   * Constructor que inicializa el `FormBuilder`, `ChangeDetectorRef`, y `BreakpointObserver`.
   * @param fb - FormBuilder para crear el formulario reactivo.
   * @param cdr - ChangeDetectorRef para forzar actualizaciones en el componente.
   * @param breakpointObserver - BreakpointObserver para detectar el tamaño de pantalla.
   */
  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private breakpointObserver: BreakpointObserver) { 
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.isSmallScreen = result.matches;
      this.cdr.detectChanges(); // Asegura que Angular detecte el cambio en isSmallScreen
    });
  }

  /**
   * Inicializa el formulario `formBanner` con validaciones.
   */
  ngOnInit() {
    this.formBanner = this.fb.group({
      logo: ['', Validators.required]
    });
  }

  /**
   * Alterna la visibilidad del contenido del formulario.
   */
  toggleContentVisibility() {
    this.isContentVisible = !this.isContentVisible;
  }

  /**
   * Maneja el evento de cambio de archivo para cargar y validar la imagen de logo, banner o póster.
   * Realiza las siguientes validaciones: tipo de archivo (solo PNG) y tamaño máximo (5 MB).
   * @param event - Evento de cambio de archivo.
   * @param type - Tipo de archivo ('logo', 'banner', o 'poster') que se está cargando.
   */
  onFileChange(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar el tipo y tamaño del archivo
      if (file.type !== 'image/png') {
        alert("Por favor sube solo archivos en formato PNG.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no debe superar los 5 MB.");
        return;
      }

      // Leer el archivo y almacenar el nombre para mostrarlo en el HTML
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'banner') {
          this.bannerUrl = result;      // Asignar URL para vista previa
          this.bannerFileName = file.name; // Guardar nombre del archivo
        } else if (type === 'poster') {
          this.posterUrl = result;       // Asignar URL para vista previa
          this.posterFileName = file.name; // Guardar nombre del archivo
        } else if (type === 'logo') {
          this.logoUrl = result;         // Asignar URL para vista previa
          this.logoFileName = file.name;  // Guardar nombre del archivo
        }
        // Forzar la actualización de la vista
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Envia el formulario y reinicia las URLs y los nombres de archivo.
   */
  onSubmit() {
    if (this.formBanner.valid) {
      console.log("Formulario enviado:", this.formBanner.value);
      this.formBanner.reset();
      this.bannerUrl = null;
      this.posterUrl = null;
      this.logoUrl = null;
    }
  }

  /**
   * Ajusta el zoom del logo mediante la rueda del ratón.
   * @param event - Evento de la rueda del ratón.
   */
  onZoom(event: WheelEvent) {
    event.preventDefault();
    const zoomFactor = 0.05; // Ajusta la sensibilidad del zoom
    this.zoom += event.deltaY > 0 ? -zoomFactor : zoomFactor;
    this.zoom = Math.min(Math.max(0.5, this.zoom), 2);
    this.logoTransform = `scale(${this.zoom})`;
  }

  /**
   * Inicia el arrastre del logo con el ratón para posicionarlo.
   * @param event - Evento de clic del ratón.
   */
  startDragging(event: MouseEvent) {
    const initialX = event.clientX - this.logoPosition.x;
    const initialY = event.clientY - this.logoPosition.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      this.logoPosition.x = moveEvent.clientX - initialX;
      this.logoPosition.y = moveEvent.clientY - initialY;
      this.logoTransform = `translate(${this.logoPosition.x}px, ${this.logoPosition.y}px) scale(${this.zoom})`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}
