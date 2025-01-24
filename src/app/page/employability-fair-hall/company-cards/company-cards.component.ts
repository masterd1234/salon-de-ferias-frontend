import { Component, OnInit } from '@angular/core';
import { CompanyDataService } from '../../../services/company-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-cards.component.html',
  styleUrl: './company-cards.component.scss',
})
export class CompanyCardsComponent implements OnInit {
  companies: any[] = [];
  selectedCompany: any = null;

  constructor(private companyDataService: CompanyDataService) {}

  ngOnInit(): void {
    this.companies = this.companyDataService.getCompanies();
  }
}
