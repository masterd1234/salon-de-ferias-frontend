import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Oferta {
  nombre: string;
  enlace: string;
  informacion: string;
  editando: boolean;
}

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
})
export class OffersComponent {
  ofertas: Oferta[] = [];
  nuevaOferta: Oferta = { nombre: '', enlace: '', informacion: '', editando: false };
  mostrarFormulario: boolean = false;
  editandoOferta: boolean = false;  // Controla si alguna oferta está siendo editada

  // Mostrar el formulario para agregar una nueva oferta
  agregarNuevaOferta() {
    this.mostrarFormulario = true;
  }

  // Guardar una nueva oferta
  guardarOferta() {
    if (this.nuevaOferta.nombre && this.nuevaOferta.enlace && this.nuevaOferta.informacion) {
      this.ofertas.push({ ...this.nuevaOferta, editando: false });
      this.nuevaOferta = { nombre: '', enlace: '', informacion: '', editando: false };
      this.mostrarFormulario = false;  // Ocultar el formulario al guardar
    }
  }

  // Iniciar edición de una oferta
  editarOferta(oferta: Oferta) {
    oferta.editando = true;
    this.editandoOferta = true;  // Activar el estado de edición
  }

  // Guardar los cambios en la oferta editada
  guardarEdicion(oferta: Oferta) {
    oferta.editando = false;
    this.editandoOferta = false;  // Desactivar el estado de edición
  }

  // Borrar una oferta de la lista
  borrarOferta(index: number) {
    this.ofertas.splice(index, 1);
  }
}
