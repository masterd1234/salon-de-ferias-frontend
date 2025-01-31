import { Component } from '@angular/core';
import { GalleryCompanyComponent } from './gallery-company/gallery-company.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-home-visitor',
  standalone: true,
  imports: [GalleryCompanyComponent, HeaderComponent],
  templateUrl: './home-visitor.component.html',
  styleUrl: './home-visitor.component.scss',
})
export class HomeVisitorComponent {}
