import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-root',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  standalone: true,
  imports: [CKEditorModule, CommonModule, ReactiveFormsModule]
})
export class FormComponent implements AfterViewInit {
  public EditorDescripcion: any;
  public EditorMasInformacion: any;
  public editorCargado: boolean = false;
  formulario: FormGroup;
  links: { title: string, url: string }[] = [];
  uploadedFiles: File[] = [];  // Almacena archivos subidos

  constructor(@Inject(PLATFORM_ID) private platformId: any, private fb: FormBuilder) { 
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]], // Campo requerido
      descripcion: ['', Validators.required], // Campo requerido
      masInformacion: [''],
      tituloBotonAdicional: [''],  // Campo para el título del enlace
      linkBotonAdicional: [''],    // Campo para el link
      links: [[]],
      file: [null]                 // Campo para archivo
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarEditor();
    }
  }

  async cargarEditor() {
    const ckeditor = await import('@ckeditor/ckeditor5-build-classic');
    this.EditorDescripcion = ckeditor.default;
    this.EditorMasInformacion = ckeditor.default;
    this.editorCargado = true;
  }

  addLink() {
    const titulo = this.formulario.get('tituloBotonAdicional')?.value;
    const link = this.formulario.get('linkBotonAdicional')?.value;
  
    if (titulo && link) {
      // Obtener el array de links actual
      const currentLinks = this.formulario.get('links')?.value || [];
      // Añadir el nuevo link al array
      currentLinks.push({ title: titulo, url: link });
      
      // Actualizar el campo links con el nuevo array
      this.formulario.get('links')?.setValue(currentLinks);
  
      // Limpiar los campos de entrada
      this.formulario.get('tituloBotonAdicional')?.reset();
      this.formulario.get('linkBotonAdicional')?.reset();
    } else {
      console.error('Faltan datos para añadir el enlace.');
    }
  }  
  removeLink(index: number): void {
    const currentLinks = this.formulario.get('links')?.value;
    currentLinks.splice(index, 1); // Remover el link en el índice dado
    this.formulario.get('links')?.setValue(currentLinks); // Actualizar el formulario con los enlaces restantes
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      for (let file of files) {
        this.uploadedFiles.push(file);  // Añadimos cada archivo al array
      }
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);  // Elimina el archivo seleccionado
  }

  // Método para enviar el formulario
  enviarFormulario() {
    if (this.formulario.valid) {
      console.log('Formulario válido:', this.formulario.value);
      // Aquí puedes realizar acciones adicionales como enviar los datos al servidor
    } else {
      console.error('Formulario inválido');
    }
  }
}