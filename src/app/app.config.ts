import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    importProvidersFrom(HttpClientModule), 
    provideHttpClient( withFetch()), // Registro global de HttpClientModule
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Inicializamos Firebase
    provideAuth(() => getAuth()) ]// Proveemos el servicio de autenticación, provideClientHydration()]
};
