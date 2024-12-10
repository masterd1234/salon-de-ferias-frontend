export const JobTypeMap: { [key: string]: string } = {
    'Full-time': 'Tiempo Completo',
    'Part-time': 'Tiempo Parcial',
    'Internship': 'Prácticas',
    'Freelance': 'Freelance',
  };
  
  /**
   * @function getJobType
   * @description Devuelve el nombre en español del tipo de trabajo basado en el código proporcionado.
   * @param {string | undefined} code - Código del tipo de trabajo (por ejemplo, 'Full-time').
   * @returns {string} Nombre en español del tipo de trabajo o un mensaje por defecto si no se encuentra.
   */
  export function getJobType(code: string | undefined): string {
    return JobTypeMap[code || ''] || 'No se encontró el tipo de trabajo';
  }
  