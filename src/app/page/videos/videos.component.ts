import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent {
  videoIds: string[] = ['dQw4w9WgXcQ', 'K4TOrB7at0Y'];
  videos: SafeResourceUrl[] = [];
  newVideo: string = '';

  constructor(private sanitizer: DomSanitizer) {
    this.loadSanitizedVideos();
  }

  // Cargar las URLs sanitizadas al inicio
  loadSanitizedVideos() {
    this.videos = this.videoIds.map(id => this.sanitizeUrl(`https://www.youtube.com/embed/${id}`));
  }

  // Método para agregar un nuevo video
  addVideo() {
    const videoId = this.getYouTubeVideoId(this.newVideo);
    if (videoId) {
      this.videoIds.push(videoId);
      this.videos.push(this.sanitizeUrl(`https://www.youtube.com/embed/${videoId}`));
      this.newVideo = ''; // Limpiar el campo de texto
    }
  }

  // Sanitizar la URL
  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Obtener el ID del video de YouTube
  getYouTubeVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  // Obtener el enlace directo a YouTube
  getYouTubeUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}
