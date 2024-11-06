import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent {
  videoUrl: string = '';

  constructor(public dialogRef: MatDialogRef<VideosComponent>) {}

  addVideo() {
    this.dialogRef.close(this.videoUrl); // Cierra el modal y envía la URL del video de vuelta
  }
}
