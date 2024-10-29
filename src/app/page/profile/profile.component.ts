import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../../models/company.model';
import { VideosComponent } from "../videos/videos.component";
import { OffersComponent } from "../offers/offers.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatButtonModule, MatCardModule, VideosComponent, OffersComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  sectorsMap: { [key: string]: string } = {
    tic: 'Tecnología de la Información y la Comunicación (TIC)',
    finanzas: 'Finanzas y Banca',
    salud: 'Salud y Farmacéutica',
    energia: 'Energía y Servicios Públicos',
    manufactura: 'Manufactura',
    automotriz: 'Automotriz',
    alimentacion: 'Alimentación y Bebidas',
    construccion: 'Construcción e Infraestructura',
    transporte: 'Transporte y Logística',
    aeronautica: 'Aeronáutica y Espacio',
    turismo: 'Turismo y Hotelería',
    educacion: 'Educación y Formación',
    agricultura: 'Agricultura y Agroindustria',
    biotecnologia: 'Biotecnología',
    retail: 'Comercio Minorista (Retail)',
    seguros: 'Seguros',
    medios: 'Medios de Comunicación y Entretenimiento',
    consultoria: 'Consultoría y Servicios Profesionales',
    inmobiliario: 'Inmobiliario y Construcción',
    quimica: 'Química e Industria Petroquímica',
    rrhh: 'Recursos Humanos',
    moda: 'Moda y Textil',
    ecommerce: 'E-commerce',
    arte: 'Arte y Cultura',
    deportes: 'Deportes y Ocio',
    medioambiente: 'Medio Ambiente y Sostenibilidad',
    legales: 'Servicios Legales',
    investigacion: 'Investigación y Desarrollo (I+D)',
    maritimo: 'Transporte Marítimo y Naval'
  };

  // Propiedades para "Descripción"
  showFullText: boolean = false;
  truncatedDescription: string = '';
  fullDescription: string = '';

  // Propiedades para "Información Adicional"
  showFullAdditionalInfo: boolean = false;
  truncatedAdditionalInfo: string = '';
  fullAdditionalInfo: string = '';

  users = signal<any[]>([]);  // Signal para almacenar los usuarios
  company = signal<Company | null>(null);
  profileImageUrl: string | null = null; // Aquí defines si hay una URL para la imagen o no

  private authService = inject(AuthService);
  private companyService = inject(CompanyService);

  constructor() {
    this.getCompanyData();  // Llamar al método cuando se inicializa el componente
    this.profileImageUrl = '';
  }

  // Alterna el estado de mostrar el texto completo
  toggleText() {
    this.showFullText = !this.showFullText;
  }
  // Alterna entre mostrar texto completo o truncado para "Información Adicional"
  toggleAdditionalInfo() {
    this.showFullAdditionalInfo = !this.showFullAdditionalInfo;
  }

  // Método para recuperar el nombre completo del sector
  getSectorName(code: string | undefined): string {
    return this.sectorsMap[code || ''] || 'Sector no definido';
  }

  // Método para obtener los datos de la empresa y configurar descripciones
  getCompanyData() {
    this.companyService.getCompany().subscribe({
      next: (data) => {
        this.company.set(data);

        // Establecer descripciones completa y truncada
        this.fullDescription = data.description || '';
        this.truncatedDescription = this.truncateHTML(this.fullDescription, 100); // Limitar a 100 caracteres o menos si quieres

        // Configurar "Información Adicional"
        this.fullAdditionalInfo = data.additional_information || '';
        this.truncatedAdditionalInfo = this.truncateHTML(this.fullAdditionalInfo, 100); // Limitar a 100 caracteres
      },
      error: (error) => console.error('Error al obtener la información de la empresa', error)
    });
  }

  // Función para truncar HTML y mantener etiquetas válidas (ya creada antes)
  truncateHTML(html: string, limit: number): string {
    const div = document.createElement("div");
    div.innerHTML = html;

    let truncated = "";
    let charCount = 0;

    function traverse(node: Node) {
      if (charCount >= limit) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (charCount + text.length > limit) {
          truncated += text.substring(0, limit - charCount) + "...";
          charCount = limit;
        } else {
          truncated += text;
          charCount += text.length;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        truncated += `<${element.tagName.toLowerCase()}${getAttributes(element)}>`;

        for (let i = 0; i < element.childNodes.length; i++) {
          traverse(element.childNodes[i]);
          if (charCount >= limit) break;
        }

        truncated += `</${element.tagName.toLowerCase()}>`;
      }
    }

    function getAttributes(element: HTMLElement): string {
      return Array.from(element.attributes)
        .map(attr => ` ${attr.name}="${attr.value}"`)
        .join("");
    }

    traverse(div);
    return truncated;
  }



  // Verifica si el usuario es Admin o CO
  isRol(): string {
    const tokenData = this.authService.decodeToken();

    if (tokenData?.rol === 'admin') {
      return 'admin';
    } else if (tokenData?.rol === 'co') {
      return 'co';
    }

    return ''; // Devuelve una cadena vacía si no es ni 'admin' ni 'co'
  }

  scrollToSection() {
    const section = document.getElementById('informacion-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }


}
