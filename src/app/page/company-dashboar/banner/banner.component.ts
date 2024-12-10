import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, EventEmitter, Output, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';

/**
 * Componente `BannerComponent`
 * Proporciona funcionalidades para subir y gestionar archivos relacionados con un banner,
 * incluyendo previsualización, zoom y posicionamiento de imágenes.
 */
@Component({
  selector: 'app-banner-root',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDividerModule, ReactiveFormsModule, MatCardModule, MatSliderModule, MatFormFieldModule]
})
export class BannerComponent implements OnInit {
  /**
   * Permite habilitar o deshabilitar la subida de archivos.
   */
  @Input() canUploadFiles: boolean = false;

  /**
   * Permite habilitar o deshabilitar el envío de archivos.
   */
  @Input() canSendFiles: boolean = false;

  /**
   * Evento que emite los archivos subidos (logo, banner, póster).
   */
  @Output() filesUploaded = new EventEmitter<{ banner: File | null, bannerUrl: string |null, poster: File |null }>();

  /** Formulario reactivo para gestionar los archivos. */
  formBanner!: FormGroup;

  /** URL de previsualización de archivos subidos. */
  bannerUrl: string | null = null;
  posterUrl: string | null = null;

  bannerFile: File | null = null; // Archivo cargado para el banner
  posterFile: File | null = null; // Archivo cargado para el póster

  /** Indicador de diseño responsivo. */
  isSmallScreen: boolean = false;

  /** Bandera para alternar visibilidad del contenido. */
  isContentVisible: boolean = false;

  /** Nombres de los archivos subidos. */
  bannerFileName: string = '';
  posterFileName: string = '';

  /**
   * Constructor del componente.
   * @param fb FormBuilder para construir formularios reactivos.
   * @param cdr ChangeDetectorRef para detectar cambios en la vista.
   * @param breakpointObserver BreakpointObserver para manejar diseño responsivo.
   */
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    public dialog: MatDialog,
    private zone: NgZone
  ) {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).subscribe(result => {
      this.zone.run(() => {
        this.isSmallScreen = result.matches;
      });
    });
  }

  /**
   * Inicializa el formulario al cargar el componente.
   */
  ngOnInit() {
    this.canUploadFiles = this.canUploadFiles ?? false;
    this.canSendFiles = this.canSendFiles ?? false;

    this.formBanner = this.fb.group({
      banner: [''],
      poster: ['']
    });
  }

  /**
   * Alterna la visibilidad del contenido adicional.
   */
  toggleContentVisibility() {
    this.isContentVisible = !this.isContentVisible;
  }

  /**
   * Maneja el cambio de archivos subidos.
   * @param event Evento de cambio del input file.
   * @param type Tipo de archivo: 'logo', 'banner' o 'poster'.
   */
  onFileChange(event: Event, type: string) {
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
          case 'banner':
            this.bannerUrl = result; // URL para previsualización
            this.bannerFileName = file.name;
            this.bannerFile = file; // Archivo original
            break;
          case 'poster':
            this.posterUrl = result;
            this.posterFileName = file.name;
            this.posterFile = file;
            break;
          default:
            console.warn(`Tipo desconocido: ${type}`);
        }

        // Emitir estado actual al padre
        this.filesUploaded.emit({
          banner: this.bannerFile || null,
          bannerUrl: this.bannerUrl || '',
          poster: this.posterFile || null,
        });

        // Detectar cambios si es necesario
        if (!this.zone.isStable) {
          this.zone.run(() => this.cdr.detectChanges());
        }
      };

      reader.readAsDataURL(file);
    }
  }


  delete(file: string): void {
    switch (file) {
      case 'banner':
        this.bannerFile = null;
        this.bannerUrl = '';
        this.bannerFileName = '';
        this.filesUploaded.emit({  banner: this.bannerFile,bannerUrl: this.bannerUrl, poster: this.posterFile });
        break;
      case 'poster':
        this.posterFile = null;
        this.posterUrl = '';
        this.posterFileName = '';
        this.filesUploaded.emit({  banner: this.bannerFile,bannerUrl: this.bannerUrl, poster: this.posterFile });
        break;
    }

  }

  /**
   * Maneja el envío del formulario si es válido.
   */
  onSubmit() {
    if (this.formBanner.valid) {
      if (this.canSendFiles) {
        console.log("Formulario enviado:", this.formBanner.value);
        this.formBanner.reset();
        this.bannerUrl = null;
        this.posterUrl = null;
        this.bannerFileName = '';
        this.posterFileName = '';
      }
    }
  }

}