import { CommonModule } from '@angular/common';
import { Component, NgZone, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss']
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  targetDate: Date = new Date('2024-12-31T23:59:59'); // Fecha objetivo
  timeLeft: { days: number; hours: number; minutes: number } = { days: 0, hours: 0, minutes: 0 };
  private intervalId: any;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.calculateTimeLeft();
    // Ejecutar el intervalo fuera de Angular y actualizar solo cada minuto
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.calculateTimeLeft();
        this.ngZone.run(() => this.cdr.detectChanges()); // Detecta cambios manualmente
      }, 60000); // Actualización cada minuto (60000 ms)
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private calculateTimeLeft(): void {
    const now = new Date().getTime();
    const difference = this.targetDate.getTime() - now;

    if (difference > 0) {
      this.timeLeft.days = Math.floor(difference / (1000 * 60 * 60 * 24));
      this.timeLeft.hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      this.timeLeft.minutes = Math.floor((difference / 1000 / 60) % 60);
    } else {
      this.timeLeft = { days: 0, hours: 0, minutes: 0 };
      clearInterval(this.intervalId); // Detener el intervalo cuando llegue a cero
    }
  }
}
