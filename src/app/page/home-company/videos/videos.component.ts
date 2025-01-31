import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

/**
 * @class VideosComponent
 * @description Este componente proporciona una interfaz para que los usuarios añadan una URL de video.
 * Está diseñado para ser usado como un componente modal, permitiendo que el usuario ingrese y envíe
 * una URL de video que se pasará de vuelta al componente padre.
 */
@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent {
  /** 
   * @property {string} videoUrl
   * @description URL del video ingresada por el usuario.
   */
  videoUrl: string = '';

    /** 
   * Formulario reactivo para la URL del video.
   */
    videoForm: FormGroup;

  /**
   * @constructor
   * @param {MatDialogRef<VideosComponent>} dialogRef - Referencia al diálogo de Angular Material, 
   * que permite controlar la instancia del modal desde el componente.
   */
  constructor(public dialogRef: MatDialogRef<VideosComponent>,private fb: FormBuilder) {
    this.videoForm = this.fb.group({
      videoUrl: ['', [Validators.required, Validators.pattern(/^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)]]
    });
  }

  /**
   * @method addVideo
   * @description Cierra el modal y envía la URL del video ingresada de vuelta al componente padre.
   * @returns {void}
   */
  addVideo(): void {
    this.dialogRef.close(this.videoUrl); // Cierra el modal y envía la URL del video de vuelta
  }
}