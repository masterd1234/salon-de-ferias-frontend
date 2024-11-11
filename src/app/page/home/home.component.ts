import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * @class HomeComponent
 * @description Este componente muestra el panel de inicio con estadísticas que aumentan
 * progresivamente (empresas, usuarios y visitas) hasta alcanzar un objetivo definido.
 * También permite la navegación a diferentes secciones de la página usando desplazamiento suave.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Contadores existentes
  companiesCount = 0;
  usersCount = 0;
  visitsCount = 0;

  private companiesTarget = 50; // Objetivo de empresas
  private usersTarget = 100;    // Objetivo de usuarios
  private visitsTarget = 7;     // Objetivo de visitas

  // Nuevo contador de cuenta atrás
  countdownTime: number = 259200; // Duración en segundos (ej. 5 minutos)
  countdownDisplay: string = '';
  private countdownInterval: any;

  constructor(private router: Router) {}

  // Navega a una sección específica de la página
  navigateToSection(sectionId: string) {
    this.router.navigate([], { fragment: sectionId }).then(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  ngOnInit() {
    this.startCounting();
    this.startCountdown(); // Iniciar el contador de cuenta atrás
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // Inicia los contadores existentes
  startCounting() {
    this.incrementCounter('companiesCount', this.companiesTarget, 10);
    this.incrementCounter('usersCount', this.usersTarget, 10);
    this.incrementCounter('visitsCount', this.visitsTarget, 1);
  }

  incrementCounter(counter: 'companiesCount' | 'usersCount' | 'visitsCount', target: number, interval: number) {
    const intervalId = setInterval(() => {
      if (this[counter] < target) {
        this[counter] += Math.ceil(target / 100); // Aumenta en partes del 1% del objetivo
      } else {
        this[counter] = target; // Fija al objetivo final
        clearInterval(intervalId);
      }
    }, interval);
  }

  // Nuevo contador de cuenta atrás
  startCountdown(): void {
    this.updateCountdownDisplay();
    this.countdownInterval = setInterval(() => {
      if (this.countdownTime > 0) {
        this.countdownTime--;
        this.updateCountdownDisplay();
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  updateCountdownDisplay(): void {
    const days = Math.floor(this.countdownTime / (24 * 3600));
    const hours = Math.floor((this.countdownTime % (24 * 3600)) / 3600);
    const minutes = Math.floor((this.countdownTime % 3600) / 60);
    const seconds = this.countdownTime % 60;
    
    this.countdownDisplay = `${this.pad(days)}d ${this.pad(hours)}h ${this.pad(minutes)}m ${this.pad(seconds)}s`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  onSubmitContactForm() {
    alert('Formulario de contacto enviado correctamente');
    // Aquí puedes implementar la lógica para enviar los datos a un backend
  }
}
