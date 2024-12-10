export interface UploadedAt {
    _seconds: number;
    _nanoseconds: number;
  }
  
  export interface Models {
    id: string;
    uploadedAt: UploadedAt;
    url: string;
    proxyUrl: string;
  }
  