
import { Component, AfterViewInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../services/information.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';

/**
 * FormComponent - Formulario para capturar y gestionar la información de una empresa.
 * 
 * Permite capturar datos como nombre de empresa, descripción, sector, archivos adjuntos, y enlaces adicionales.
 * Integra editores de texto enriquecido CKEditor y manejo de archivos.
 */

@Component({
  selector: 'app-form-root',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [CKEditorModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatOptionModule]
})
export class FormComponent implements AfterViewInit {
  /** Editor de CKEditor para el campo de descripción */
  public EditorDescription: any;
  /** Editor de CKEditor para el campo de información adicional */
  public EditorAdditionalInfo: any;
  /** Bandera que indica si el editor se ha cargado en el navegador */
  public editorLoaded: boolean = false;
  /** Mensaje de éxito después de enviar el formulario */
  successMessage: string = '';
  /** Mensaje de error si falla el envío del formulario */
  errorMessage: string = '';
  /** Grupo de formulario que contiene todos los campos de la empresa */
  companyForm!: FormGroup;
  @Input() form!: FormGroup; // Aceptar un FormGroup externo
  /** Lista de archivos subidos */
  uploadedFiles: File[] = [];
  /** Estado de envío para deshabilitar el botón de enviar mientras se procesa */
  isSubmitting: boolean = false;
  /** Mensaje de error relacionado con los archivos subidos */
  fileError: string = '';

  /**
   * Constructor de FormComponent - Inicializa el formulario reactivo y el servicio de la compañía.
   * @param platformId Identificador de la plataforma para verificar si se ejecuta en navegador
   * @param fb FormBuilder para crear y manipular formularios reactivos
   * @param companyService Servicio para realizar la petición de envío
   */
  constructor(@Inject(PLATFORM_ID) private platformId: any, private fb: FormBuilder, private companyService: CompanyService) {
  }


  ngOnInit(): void {
    // Si no se proporciona un formulario desde el padre, inicializa el formulario interno
    if (!this.form) {
      this.companyForm = this.fb.group({
        description: ['', Validators.required],
        additional_information: [''],
        sector: [''],
        additionalButtonTitle: [''], // Campo para título de enlace adicional
        additionalButtonLink: [''],  // Campo para link adicional
        links: this.fb.array([]),     // Arreglo de enlaces adicionales
        files: this.fb.array([]),     // Arreglo de archivos subidos
      });
    }
  }

  // Getter para acceder al FormGroup activo (ya sea externo o interno)
  get activeForm(): FormGroup {
    return this.form || this.companyForm;
  }
  /**
   * Ciclo de vida - ngAfterViewInit. Carga el editor solo en el navegador.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadEditor();
    }
  }

  /**
   * Método asíncrono para cargar el editor CKEditor.
   */
  async loadEditor() {
    const ckeditor = await import('@ckeditor/ckeditor5-build-classic');
    this.EditorDescription = ckeditor.default;
    this.EditorAdditionalInfo = ckeditor.default;
    this.editorLoaded = true;
  }

  /**
 * Getter para acceder al FormArray de los archivos subidos.
 * @returns FormArray de archivos subidos en el formulario.
 */
  get files(): FormArray {
    return this.activeForm.get('files') as FormArray;
  }

  /** 
   * Getter para acceder al FormArray de los enlaces adicionales 
   * @returns FormArray de enlaces adicionales en el formulario
   */
  get links(): FormArray {
    return this.activeForm.get('links') as FormArray;
  }

  /**
   * Verifica si los campos de título y enlace están llenos para habilitar el botón "Añadir enlace".
   * @returns boolean - true si los campos de enlace están válidos, de lo contrario false
   */
  canAddLink(): boolean {
    return (this.activeForm.get('additionalButtonTitle')?.valid ?? false) && (this.activeForm.get('additionalButtonLink')?.valid ?? false);
  }

  /**
   * Añade un nuevo enlace al FormArray de enlaces si el título y el link son válidos.
   */
  addLink() {
    const title = this.activeForm.get('additionalButtonTitle')?.value;
    const link = this.activeForm.get('additionalButtonLink')?.value;

    if (title && link) {
      const linkGroup = this.fb.group({
        additionalButtonTitle: [title, Validators.required],
        additionalButtonLink: [link, [Validators.required, Validators.pattern('https?://.+')]]
      });

      this.links.push(linkGroup);
      this.activeForm.get('additionalButtonTitle')?.reset();
      this.activeForm.get('additionalButtonLink')?.reset();
    }
  }

  /**
   * Elimina un enlace del arreglo de enlaces adicionales
   * @param index - índice del enlace a eliminar en el FormArray
   */
  removeLink(index: number): void {
    this.links.removeAt(index);
  }

  /**
  * Maneja el cambio de archivos subidos, limitando el tamaño máximo a 5MB.
  * @param event Evento de cambio del archivo
  */
  onFileChange(event: any): void {
    const files = event.target.files;
    this.fileError = '';

    if (files.length > 0) {
      for (let file of files) {
        if (file.size > 5000000) { // Limitar tamaño a 5MB
          this.fileError = 'El tamaño del archivo no puede exceder los 5MB';
          return;
        }

        // Agregar el archivo al FormArray como un control
        this.files.push(this.fb.control(file));
      }
    }
  }

  /**
   * Elimina un archivo de la lista de archivos subidos.
   * @param index Índice del archivo a eliminar en el arreglo de archivos subidos
   */
  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  /**
   * Envía el formulario si es válido, realiza una petición para añadir una empresa.
   * Maneja los mensajes de éxito y error.
   */
  submitForm() {
    if (this.activeForm.valid) {
      const formData = this.activeForm.value;

      // Eliminar los campos nulos si no se necesitan
      if (!formData.additionalButtonTitle) delete formData.additionalButtonTitle;
      if (!formData.additionalButtonLink) delete formData.additionalButtonLink;

      this.isSubmitting = true;
      this.companyService.addCompanyInformation(formData).subscribe({
        next: () => {
          this.successMessage = 'Información enviada correctamente';
          this.errorMessage = '';
          this.isSubmitting = false;
        },
        error: (error) => {
          this.successMessage = '';
          this.errorMessage = `Error: ${error.error.message}`;
          this.isSubmitting = false;

          console.error('Error al enviar la solicitud:', error);
        }
      });
    } else {
      console.error('Formulario inválido');
    }
  }
}
