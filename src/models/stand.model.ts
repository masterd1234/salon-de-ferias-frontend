export interface StandConfig {
    recepcionistPosition: object; // Cambia a una estructura más específica si conoces los campos
    logoPosition: object; // Cambia a una estructura más específica si conoces los campos
    bannerPosition: object; // Cambia a una estructura más específica si conoces los campos
  }
  
  export interface UploadedAt {
    _seconds: number;
    _nanoseconds: number;
  }
  
  export interface Stand {
    id: string;
    standConfig: StandConfig;
    uploadedAt: UploadedAt;
    url: string;
    proxyUrl: string;
  }
  