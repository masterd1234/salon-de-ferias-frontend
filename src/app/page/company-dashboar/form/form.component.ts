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

  constructor(@Inject(PLATFORM_ID) private platformId: any, private fb: FormBuilder) { 
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]], // Campo requerido
      descripcion: ['', Validators.required], // Campo requerido
      masInformacion: [''],
      tituloBotonAdicional: [''],
      linkBotonAdicional: ['']
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