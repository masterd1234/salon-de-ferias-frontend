import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { OffersService } from '../../services/offers.service';
import { ExtendedOffer, Offer } from '../../../models/offers/offers.model';
import { OffersComponent } from '../profile/offers/offers.component';
import { provinciasEspana } from '../../../models/offers/provincias.model';
import { getJobType, JobTypeMap } from '../../../models/offers/jobType.model';
import { getSectorName, sectorsMap } from '../../../models/offers/sector.model';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/users.service';

@Component({
  selector: 'app-offers-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule
  ],
  templateUrl: './all-offers.component.html',
  styleUrls: ['./all-offers.component.scss'],
})
export class AllOffersComponent implements OnInit {
  offers: ExtendedOffer[] = [];
  filteredOffers: ExtendedOffer[] = [];
  expandedOfferId: string | null = null;

  JobTypeMap = JobTypeMap;
  jobTypeKeys = Object.keys(JobTypeMap)
  getJobType = getJobType;

  sectorName = sectorsMap;
  sectorKeys = Object.keys(sectorsMap)
  getSectorsName = getSectorName;
  // Opciones de filtros
  provinces = provinciasEspana;

  companies: string[] = [];
  modalities: string[] = ['Presencial', 'Remoto', 'Híbrido'];

  // Formulario reactivo para filtros
  filtersForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private offersService: OffersService,
    public dialog: MatDialog,
    private userService: UserService
  ) {
    this.filtersForm = this.fb.group({
      keyword: [''],
      province: [''],
      offerType: [''],
      sector: [''],
      company: [''],
      mode: [''],
    });
  }

  ngOnInit(): void {
    // Carga de ofertas desde el servicio
    this.offersService.getAllOffers().subscribe({
      next: (response) => {
        if (response.success && response.offers) {
          this.processOffers(response.offers).then((processedOffers) => {
            this.offers = processedOffers;
            this.filteredOffers = [...this.offers];
          });
        } else {
          console.error('Error al obtener las ofertas:', response.message);
        }
      },
      error: (err) => {
        console.error('Error inesperado al obtener ofertas:', err);
      },
    });

    this.userService.getAllUsersByType('companies').subscribe({
      next: (response) => {
        if (response.length > 0) {
          this.companies = response.map((company) => company.name); // Extrae solo los nombres
          console.log('Nombres de empresas cargados:', this.companies);
        } else {
          console.warn('No se encontraron empresas');
        }
      },
      error: (err) => {
        console.error('Error inesperado al obtener empresas:', err);
      },
    });
  }


  /**
   * Aplica los filtros seleccionados en el formulario reactivo.
   */
  applyFilters(): void {
    const { province, offerType, sector, company, mode, keyword } = this.filtersForm.value;

    const params = {
      location: province,
      job_type: offerType,
      sector,
      company,
      workplace_type: mode,
      keyword
    };

    this.offersService.searchOffers(params).subscribe({
      next: async (response) => {
        if (response.success && response.offers) {
          this.filteredOffers = await this.processOffers(response.offers); // Usa processOffers
        } else {
          console.error('Error al buscar ofertas:', response.message);
        }
      },
      error: (err) => {
        console.error('Error inesperado al buscar ofertas:', err);
      },
    });
  }


  checkAspectRatio(logoUrl: string | undefined): Promise<'square' | 'rectangular'> {
    return new Promise((resolve) => {
      if (!logoUrl) {
        resolve('rectangular'); // Considera rectangular si no hay URL
        return;
      }

      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;

        // Clasificar como cuadrado o rectangular
        if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
          resolve('square'); // Casi cuadrado
        } else {
          resolve('rectangular'); // Alargado
        }
      };
      img.onerror = () => {
        resolve('rectangular'); // En caso de error, considera rectangular
      };
      img.src = logoUrl;
    });
  }



  async processOffers(offers: Offer[]): Promise<ExtendedOffer[]> {
    return Promise.all(
      offers.map(async (offer) => {
        const aspectType = await this.checkAspectRatio(offer.logo?.url);
        return {
          ...offer,
          aspectType,
        } as ExtendedOffer;
      })
    );
  }


  /**
   * Resetea los filtros y muestra todas las ofertas.
   */
  resetFilters(): void {
    this.filtersForm.reset();
    this.filteredOffers = [...this.offers];
  }



  /**
   * Alterna la visualización de los detalles de una oferta.
   * @param offerId ID de la oferta.
   */
  toggleOfferDetails(offerId: string): void {
    this.expandedOfferId = this.expandedOfferId === offerId ? null : offerId;
  }

  /**
   * Cierra los detalles de una oferta.
   * @param event Evento de clic.
   */
  closeOfferDetails(event: Event): void {
    event.stopPropagation();
    this.expandedOfferId = null;
  }
}
