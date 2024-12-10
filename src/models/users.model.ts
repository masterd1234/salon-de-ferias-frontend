/**
 * @interface Usuario
 * @description Interfaz que representa los datos de un usuario en la aplicación, incluyendo propiedades opcionales específicas para diferentes roles (admin, co y visitor).
 */
export interface Usuario {
id?: string;
name: string;
email: string;
password: string;
rol: string;
file?: File;
cv?: File;
phone?: number;
subname?: string;
studies?: string;
cif?: string;
dni?: string;
logo?: string;
}
