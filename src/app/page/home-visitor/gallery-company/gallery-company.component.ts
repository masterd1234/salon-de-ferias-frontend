import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyDataService } from '../../../services/company-data.service';

@Component({
  selector: 'app-gallery-company',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-company.component.html',
  styleUrl: './gallery-company.component.scss',
})
export class GalleryCompanyComponent implements OnInit {
  companies: any[] = [];

  constructor(private companyService: CompanyDataService) {}

  ngOnInit(): void {
    this.companyService.getAllCompanies().subscribe({
      next: (response) => {
        this.companies = response.companies;
      },
      error: (err) => {
        console.error('Error al obtener las empresas:', err);
      },
    });
  }
}
