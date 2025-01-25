import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CountdownTimerComponent } from './countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CountdownTimerComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  // Contadores existentes
  companiesCount = 0;
  usersCount = 0;
  visitsCount = 0;

  private companiesTarget = 50; // Objetivo de empresas
  private usersTarget = 100; // Objetivo de usuarios
  private visitsTarget = 7; // Objetivo de visitas

  countdownTime: number = 10; // Duración en segundos (ej. 5 minutos)
  countdownDisplay: string = '';
  private countdownInterval: any;

  // Formulario reactivo
  contactForm!: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => this.startCounting(), 500); // Inicia después de 500 ms
    this.initializeForm(); // Inicializar el formulario reactivo
  }

  // Inicializa el formulario reactivo con validaciones
  private initializeForm() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  // Navega a una sección específica de la página
  navigateToSection(sectionId: string) {
    this.router.navigate([], { fragment: sectionId }).then(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Inicia los contadores existentes
  startCounting() {
    this.incrementCounterWithAnimation('companiesCount', this.companiesTarget);
    this.incrementCounterWithAnimation('usersCount', this.usersTarget);
    this.incrementCounterWithAnimation('visitsCount', this.visitsTarget);
  }

  incrementCounterWithAnimation(
    counter: 'companiesCount' | 'usersCount' | 'visitsCount',
    target: number
  ) {
    const increment = Math.ceil(target / 100);

    const updateCounter = () => {
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        if (this[counter] < target) {
          this[counter] += increment;
          this.cdr.markForCheck(); // Marca el componente para la detección de cambios
          window.requestAnimationFrame(updateCounter);
        } else {
          this[counter] = target;
        }
      }
    };

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(updateCounter);
    }
  }

  // Maneja el envío del formulario
  onSubmitContactForm() {
    if (this.contactForm.valid) {
      console.log('Formulario enviado:', this.contactForm.value);
      alert('Formulario de contacto enviado correctamente');
    } else {
      alert('Por favor, completa todos los campos requeridos');
    }
  }
}
