import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalendarEventsService } from '../../../services/calendar-events.service';
import { ReactiveFormsModule } from '@angular/forms'; // <-- Importa aquí

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
})
export class EventFormComponent {
  eventForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eventService: CalendarEventsService,
    private dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { companyID: string }
  ) {
    this.eventForm = this.fb.group({
      name_date: ['', Validators.required],
      description: ['', Validators.required],
      link_event: [
        '',
        [Validators.required, Validators.pattern(/^https?:\/\/.+/)],
      ],
    });
  }

  submitForm() {
    if (this.eventForm.valid) {
      this.eventService
        .addEvent(this.data.companyID, this.eventForm.value)
        .subscribe({
          next: (response) => {
            console.log('Evento guardado:', response);
            this.dialogRef.close(true); // Cerrar modal y actualizar datos
          },
          error: (error) => {
            console.error('Error al guardar el evento:', error);
          },
        });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
