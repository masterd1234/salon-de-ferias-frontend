/**
 * @interface Usuario
 * @description Interfaz que representa los datos de un usuario en la aplicación, incluyendo propiedades opcionales específicas para diferentes roles (admin, co y visitor).
 */
export interface Usuario {
  /**
   * @property {string} [id] - ID único del usuario (opcional).
   */
  id?: string;

  /**
   * @property {string} name - Nombre del usuario.
   */
  name: string;

  /**
   * @property {string} email - Correo electrónico del usuario.
   */
  email: string;

  /**
   * @property {'admin' | 'co' | 'visitor'} rol - Rol del usuario, que puede ser:
   * - `admin`: Administrador del sistema.
   * - `co`: Representante de una empresa.
   * - `visitor`: Visitante de la feria.
   */
  rol: 'admin' | 'co' | 'visitor';

  /**
   * @property {string} password - Contraseña hasheada del usuario.
   */
  password: string;

  /**
   * @property {string} [company] - Solo para usuarios con rol `co`. Nombre de la empresa del usuario.
   */
  company?: string;

  /**
   * @property {string} [standId] - Solo para usuarios con rol `co`. ID del stand asociado a la empresa del usuario.
   */
  standId?: string;

  /**
   * @property {string} [cif] - Solo para usuarios con rol `co`. CIF (Código de Identificación Fiscal) de la empresa.
   */
  cif?: string;

  /**
   * @property {string} [dni] - Solo para usuarios con rol `visitor`. DNI (Documento Nacional de Identidad) del visitante.
   */
  dni?: string;

  /**
   * @property {string} [studies] - Solo para usuarios con rol `visitor`. Estudios del visitante.
   */
  studies?: string;

  /**
   * @property {Date} [createdAt] - Fecha de creación del usuario en el sistema.
   */
  createdAt?: Date;
}
