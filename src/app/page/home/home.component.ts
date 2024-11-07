import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  companiesCount = 0;
  usersCount = 0;
  visitsCount = 0;

  private companiesTarget = 50; // Objetivo de stand
  private usersTarget = 100;    // Objetivo de empresas
  private visitsTarget = 7;   // Objetivo de dias de feria

  constructor(private router: Router) {}

  navigateToSection(sectionId: string) {
    // Navega al fragmento en la URL
    this.router.navigate([], { fragment: sectionId }).then(() => {
      // Desplazamiento manual después de actualizar la URL
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }


  ngOnInit() {
    this.startCounting();
  }

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

}
