/**
 * @interface Offer
 * @description Interfaz que representa una oferta de trabajo en la aplicación, incluyendo información sobre el puesto, la ubicación, el tipo de empleo y detalles de la empresa.
 */
export interface Offer {
  /**
   * @property {string} [id] - ID único de la oferta (opcional).
   */
  id?: string;

  /**
   * @property {string} [companyName] - Nombre de la empresa que ofrece el trabajo (opcional).
   */
  companyName?: string;

  /**
   * @property {string} position - Título o posición del puesto de trabajo.
   */
  position: string;

  /**
   * @property {string} [workplace_type] - Tipo de lugar de trabajo (por ejemplo, "remoto", "presencial", etc.).
   */
  workplace_type?: string;

  /**
   * @property {string} location - Ubicación geográfica del puesto de trabajo.
   */
  location: string;

  /**
   * @property {string} [job_type] - Tipo de empleo (por ejemplo, "tiempo completo", "medio tiempo", etc.).
   */
  job_type?: string;

  /**
   * @property {string} description - Descripción detallada de la oferta de trabajo.
   */
  description: string;

  /**
   * @property {string} [companyID] - ID de la empresa asociada a la oferta (opcional, ya que se puede asignar en el backend).
   */
  companyID?: string;

  /**
   * @property {string} [createdAt] - Fecha de creación de la oferta, en formato de cadena (opcional).
   */
  createdAt?: string;

    /**
   * @property {string} [sector] - Fecha de creación de la oferta, en formato de cadena (opcional).
   */
    sector?: string;

    logo?: {
      url: string;
      id: string;
    }

    link: string;
}
export interface ExtendedOffer extends Offer {
  aspectType: string;
}

export interface OffersResponse {
  offers?: Offer[];
  message: string;
  success: boolean;
}