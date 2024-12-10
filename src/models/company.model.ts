/**
 * @interface Company
 * @description Interfaz que representa la información de una empresa, incluyendo descripción, sector, información de contacto y documentos opcionales.
 */
export interface Company {

  /**
   * @property {string} description - Descripción general de la empresa.
   */
  description: string;

  /**
   * @property {string} [additional_information] - Información adicional sobre la empresa (opcional).
   */
  additional_information?: string;

  /**
   * @property {string} [sector] - Sector de la industria al que pertenece la empresa (opcional).
   */
  sector?: string;

  /**
   * @property {string[]} [documents] - Array de URLs de documentos relacionados con la empresa (opcional).
   */
  documents?: File[];

  /**
   * @property {Array<{additionalButtonTitle: string, additionalButtonLink: string}>} [link] - Array de objetos que contiene título y enlace URL adicionales relacionados con la empresa (opcional).
   */
  links?: Array<{
    additionalButtonTitle: string,
    additionalButtonLink: string
  }>;
}

/**
 * @interface selection
 * @description Interfaz que representa la selección de URLs asociadas con un stand y una recepción en una feria o evento.
 */
export interface selection {
  /**
   * @property {string} URLStand - URL de la imagen o recurso para el stand de la empresa.
   */
  standID: string;

  /**
   * @property {string} URLRecep - URL de la imagen o recurso para la recepción de la empresa.
   */
  recepID: string;
}
