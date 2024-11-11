export interface Offer {
    id?: string;
    companyName?:string;
    position: string;
    workplace_type?: string;
    location: string;
    job_type?: string;
    description: string;
    companyID?: string;  // Este campo puede ser opcional ya que se asigna en el backend
    createdAt?: string;  // Campo opcional para la fecha de creación
  }