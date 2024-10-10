export interface Usuario {
  id?: string;              // El ID puede ser opcional
  name: string;             // Nombre del usuario
  email: string;            // Email del usuario
  rol: 'admin' | 'co' | 'visitor';  // El rol del usuario: admin, co o visitor
  password: string;         // Contraseña hasheada del usuario
  company?: string;         // Solo para CO: Nombre de la empresa
  standId?: string;         // Solo para CO: ID del stand asociado
  cif?: string;             // Solo para CO: CIF de la empresa
  dni?: string;             // Solo para Visitante: DNI del visitante
  studies?: string;         // Solo para Visitante: Estudios del visitante
  createdAt?: Date;         // Fecha de creación del usuario
}