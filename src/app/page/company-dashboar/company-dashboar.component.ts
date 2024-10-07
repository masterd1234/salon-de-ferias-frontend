import { Component } from '@angular/core';
import { ImageService } from '../../services/imagen.service';
import { CarouselComponent, CarouselControlComponent, CarouselIndicatorsComponent, CarouselInnerComponent, CarouselItemComponent } from '@coreui/angular';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-dashboar',
  standalone: true,
  imports: [CarouselComponent, CarouselControlComponent, CarouselIndicatorsComponent, CarouselInnerComponent, CarouselItemComponent, RouterLink, CommonModule],
  templateUrl: './company-dashboar.component.html',
  styleUrl: './company-dashboar.component.css'
})
export class CompanyDashboarComponent {

  //Carousel de ejemplos
  slides: string[] = [];

  constructor(private imageService: ImageService) { }

  ngOnInit(): void {
    // Obtener las imágenes del servicio
    this.imageService.getStands().subscribe(images => {
      this.slides = images;
    });
  }
}
