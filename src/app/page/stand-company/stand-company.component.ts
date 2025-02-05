import {
  Component,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyDataService } from '../../services/company-data.service';
import { getSectorName, sectorsMap } from '../../../models/offers/sector.model';
import { getJobType, JobTypeMap } from '../../../models/offers/jobType.model';
import { Offer } from '../../../models/offers/offers.model';
import { VideosComponent } from '../profile/videos/videos.component';
import { VideoService } from '../../services/videos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-stand-company',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
  ],
  templateUrl: './stand-company.component.html',
  styleUrl: './stand-company.component.scss',
})
export class StandCompanyComponent implements OnInit {
  company: any = null;

  offers: Offer[] = [];
  expandedOfferId: string | null = null;
  /** Lista de videos en formato seguro */
  videos: SafeResourceUrl[] = [];
  getJobType = getJobType;
  getSectorName = getSectorName;
  cols: number = 3;
  isSmallScreen: boolean = false;

  showFullText: boolean = false;
  truncatedDescription: string = '';
  fullDescription: string = '';
  showFullAdditionalInfo: boolean = false;
  truncatedAdditionalInfo: string = '';
  fullAdditionalInfo: string = '';

  private router = inject(Router);

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyDataService,
    private location: Location
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const companyId = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la URL
    if (companyId) {
      this.companyService.getAllCompanies().subscribe({
        next: (response) => {
          this.company = response.companies.find((c) => c.id === companyId);
        },
        error: (err) => {
          console.error('Error al obtener los datos de la empresa:', err);
        },
      });
    }
  }

  goBack(): void {
    this.location.back(); // 🔙 Regresa a la página anterior
  }

  /**
   * Desplaza la vista hacia la sección de información del perfil.
   */
  scrollToSection(sectionId: string) {
    this.router.navigate([], { fragment: sectionId }).then(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /**
   * Alterna el estado de visualización entre texto completo y truncado.
   */
  toggleText() {
    this.showFullText = !this.showFullText;
  }

  /**
   * Alterna entre mostrar texto completo o truncado en "Información Adicional".
   */
  toggleAdditionalInfo() {
    this.showFullAdditionalInfo = !this.showFullAdditionalInfo;
  }

  /** Configura el tamaño de pantalla como "pequeña" si el ancho es menor o igual a 768px. */
  checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      // Validamos si window está disponible
      this.isSmallScreen = window.innerWidth <= 768;
    } else {
      console.warn('El objeto `window` no está disponible.');
      this.isSmallScreen = false; // Establece un valor predeterminado si window no está disponible
    }
  }

  /**
   * Alterna la visualización de los detalles de una oferta.
   * @param offerId ID de la oferta.
   */
  toggleOfferDetails(offerId: string) {
    this.expandedOfferId = this.expandedOfferId === offerId ? null : offerId;
  }
}
