
import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
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
  styleUrls: ['./form.component.css'],
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
  companyForm: FormGroup;
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
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      additional_information: [''],
      email:  [''],
      sector: [''],
      additionalButtonTitle: [''],  // Campo para el título del enlace temporal
      additionalButtonLink: [''],   // Campo para el link temporal
      links: this.fb.array([])      // Arreglo de enlaces adicionales
    });
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
   * Getter para acceder al FormArray de los enlaces adicionales 
   * @returns FormArray de enlaces adicionales en el formulario
   */
  get links(): FormArray {
    return this.companyForm.get('links') as FormArray;
  }

  /**
   * Verifica si los campos de título y enlace están llenos para habilitar el botón "Añadir enlace".
   * @returns boolean - true si los campos de enlace están válidos, de lo contrario false
   */
  canAddLink(): boolean {
    return (this.companyForm.get('additionalButtonTitle')?.valid ?? false) && (this.companyForm.get('additionalButtonLink')?.valid ?? false);
  }

  /**
   * Añade un nuevo enlace al FormArray de enlaces si el título y el link son válidos.
   */
  addLink() {
    const title = this.companyForm.get('additionalButtonTitle')?.value;
    const link = this.companyForm.get('additionalButtonLink')?.value;

    if (title && link) {
      const linkGroup = this.fb.group({
        additionalButtonTitle: [title, Validators.required],
        additionalButtonLink: [link, [Validators.required, Validators.pattern('https?://.+')]]
      });

      this.links.push(linkGroup);
      this.companyForm.get('additionalButtonTitle')?.reset();
      this.companyForm.get('additionalButtonLink')?.reset();
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
  onFileChange(event: any) {
    const files = event.target.files;
    this.fileError = '';
    if (files.length > 0) {
      for (let file of files) {
        if (file.size > 5000000) { // Limitar tamaño a 5MB
          this.fileError = 'El tamaño del archivo no puede exceder los 5MB';
          return;
        }
        this.uploadedFiles.push(file);
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
    if (this.companyForm.valid) {
      const formData = this.companyForm.value;

      // Eliminar los campos nulos si no se necesitan
      if (!formData.additionalButtonTitle) delete formData.additionalButtonTitle;
      if (!formData.additionalButtonLink) delete formData.additionalButtonLink;

      this.isSubmitting = true;
      this.companyService.addCompany(formData).subscribe({
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
