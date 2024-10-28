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

@Component({
  selector: 'app-form-root',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  standalone: true,
  imports: [CKEditorModule, CommonModule,MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatOptionModule]
})
export class FormComponent implements AfterViewInit {
  public EditorDescription: any;
  public EditorAdditionalInfo: any;
  public editorLoaded: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  companyForm: FormGroup;
  uploadedFiles: File[] = [];
  isSubmitting: boolean = false; // Estado de envío
  fileError: string = ''; // Errores de archivos

  constructor(@Inject(PLATFORM_ID) private platformId: any, private fb: FormBuilder, private companyService: CompanyService) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      additional_information: [''],
      email:  [''],
      sector: [''],
      additionalButtonTitle: [''],  // Campo para el título del enlace temporal
      additionalButtonLink: [''],   // Campo para el link temporal
      links: this.fb.array([])
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadEditor();
    }
  }

  async loadEditor() {
    const ckeditor = await import('@ckeditor/ckeditor5-build-classic');
    this.EditorDescription = ckeditor.default;
    this.EditorAdditionalInfo = ckeditor.default;
    this.editorLoaded = true;
  }

  get links(): FormArray {
    return this.companyForm.get('links') as FormArray;
  }

  canAddLink(): boolean {
    return (this.companyForm.get('additionalButtonTitle')?.valid ?? false) && (this.companyForm.get('additionalButtonLink')?.valid ?? false);
  }
  
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

  removeLink(index: number): void {
    this.links.removeAt(index);
  }

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

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  submitForm() {
    if (this.companyForm.valid) {
      const formData = this.companyForm.value;

  
      // Eliminar los campos nulos si no se necesitan
      if (!formData.additionalButtonTitle) {
        delete formData.additionalButtonTitle;
      }
      if (!formData.additionalButtonLink) {
        delete formData.additionalButtonLink;
      }
  
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
  
          // Ver más detalles del error
          console.error('Error al enviar la solicitud:', error);
        }
      });
    } else {
      console.error('Formulario inválido');
    }
  }
}
