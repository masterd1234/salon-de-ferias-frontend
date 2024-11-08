import { Component } from '@angular/core';
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
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  /** 
   * @property {number} companiesCount - Contador de empresas mostrado en la página.
   */
  companiesCount = 0;
  
  /** 
   * @property {number} usersCount - Contador de usuarios mostrado en la página.
   */
  usersCount = 0;
  
  /** 
   * @property {number} visitsCount - Contador de visitas mostrado en la página.
   */
  visitsCount = 0;

  /**
   * @private
   * @property {number} companiesTarget - Objetivo final de empresas.
   */
  private companiesTarget = 50;

  /**
   * @private
   * @property {number} usersTarget - Objetivo final de usuarios.
   */
  private usersTarget = 100;

  /**
   * @private
   * @property {number} visitsTarget - Objetivo final de visitas.
   */
  private visitsTarget = 7;

  /**
   * @constructor
   * @param {Router} router - Servicio de enrutamiento de Angular para manejar la navegación.
   */
  constructor(private router: Router) {}

  /**
   * @method navigateToSection
   * @description Navega a una sección específica de la página, desplazándose suavemente hacia el elemento
   * identificado por el `sectionId`.
   * @param {string} sectionId - ID de la sección a la que se debe desplazar.
   */
  navigateToSection(sectionId: string): void {
    this.router.navigate([], { fragment: sectionId }).then(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /**
   * @method ngOnInit
   * @description Método del ciclo de vida de Angular que se llama al inicializar el componente.
   * Inicia los contadores.
   */
  ngOnInit(): void {
    this.startCounting();
  }

  /**
   * @method startCounting
   * @description Inicia el conteo progresivo para cada contador (companies, users, visits).
   */
  startCounting(): void {
    this.incrementCounter('companiesCount', this.companiesTarget, 10);
    this.incrementCounter('usersCount', this.usersTarget, 10);
    this.incrementCounter('visitsCount', this.visitsTarget, 1);
  }

  /**
   * @method incrementCounter
   * @description Incrementa el valor de un contador de forma progresiva hasta alcanzar su objetivo.
   * @param {'companiesCount' | 'usersCount' | 'visitsCount'} counter - El contador a incrementar.
   * @param {number} target - El objetivo final que debe alcanzar el contador.
   * @param {number} interval - Intervalo de tiempo en milisegundos entre cada incremento.
   */
  incrementCounter(counter: 'companiesCount' | 'usersCount' | 'visitsCount', target: number, interval: number): void {
    const intervalId = setInterval(() => {
      if (this[counter] < target) {
        this[counter] += Math.ceil(target / 100); // Incremento progresivo
      } else {
        this[counter] = target; // Fija el contador en el objetivo
        clearInterval(intervalId);
      }
    }, interval);
  }
}
