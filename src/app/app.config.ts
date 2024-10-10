import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    importProvidersFrom (BrowserAnimationsModule),
    importProvidersFrom(HttpClientModule), 
    provideHttpClient( withFetch()), // Registro global de HttpClientModule
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Inicializamos Firebase
    provideAuth(() => getAuth()) ]// Proveemos el servicio de autenticación, provideClientHydration()]
};
