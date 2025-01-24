import { Component } from '@angular/core';
import { CompanyCardsComponent } from './company-cards/company-cards.component';

@Component({
  selector: 'app-employability-fair-hall',
  standalone: true,
  imports: [CompanyCardsComponent],
  templateUrl: './employability-fair-hall.component.html',
  styleUrl: './employability-fair-hall.component.scss',
})
export class EmployabilityFairHallComponent {}
