export interface Company {
    name: string;
    description: string;
    additional_information?: string; // Campo opcional
    sector?: string;
    correo?: string;
    email?: string;
    documents?: string[];            // Array de URLs opcional
    link?:Array<{
      additionalButtonTitle: string,
      additionalButtonLink: string
    } >            // Array de URLs opcional
  }

  export interface selection {
    URLStand: string;
    URLRecep: string;
    StandID?: string;
  }