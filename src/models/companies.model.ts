/**
 * @interface Companies
 * @description Interfaz que representa la información de una empresa, incluyendo descripción, sector, información de contacto y documentos opcionales.
 */
export interface Company {
  id: string;
  name: string;
  email: string;
  cif: string;
  information: boolean;
  design: boolean;
  logo: string | null;
}
export interface ApiResponse {
  companies: Company[];
}
