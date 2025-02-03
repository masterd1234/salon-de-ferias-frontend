import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyDataService } from '../../services/company-data.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-stand-company',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stand-company.component.html',
  styleUrl: './stand-company.component.scss',
})
export class StandCompanyComponent implements OnInit {
  company: any = null;

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
}
