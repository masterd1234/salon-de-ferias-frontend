import { Component, computed, EventEmitter, Output, signal, WritableSignal } from '@angular/core';
import { ImageService } from '../../services/imagen.service';
import { CarouselComponent, CarouselControlComponent, CarouselIndicatorsComponent, CarouselInnerComponent, CarouselItemComponent } from '@coreui/angular';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormComponent } from "./form/form.component";
import { StandDesingComponent } from "./stand-desing/stand-desing.component";
import { Writable } from 'stream';
import { BannerComponent } from "../banner/banner.component";
import { MatCardModule } from '@angular/material/card';



@Component({
  selector: 'app-company-dashboar',
  standalone: true,
  imports: [CarouselComponent,MatCardModule, CarouselControlComponent, CarouselIndicatorsComponent, CarouselInnerComponent, CarouselItemComponent, RouterLink, CommonModule, FormComponent, StandDesingComponent, BannerComponent],
  templateUrl: './company-dashboar.component.html',
  styleUrl: './company-dashboar.component.scss'
})
export class CompanyDashboarComponent {

  //Carousel de ejemplos
  slides: string[] = [];

  // Usamos `WritableSignal` para almacenar el estado de selección
  standSelected: WritableSignal<boolean> = signal(false);
  receptionistSelected: WritableSignal<boolean> = signal(false);

  // Señal computada para `canUploadFiles`, que depende de `standSelected` y `receptionistSelected`
  canUploadFiles = computed(() => this.standSelected() && this.receptionistSelected());

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    // Obtener las imágenes del servicio
    this.imageService.getStands().subscribe(images => {
      this.slides = images;
    });
  }

  // Métodos públicos para actualizar el estado de selección
  setStandSelected(selected: boolean) {
    this.standSelected.set(selected);
  }

  setReceptionistSelected(selected: boolean) {
    this.receptionistSelected.set(selected);
  }
}
