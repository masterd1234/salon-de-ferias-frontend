import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/**
 * @constant {ApplicationConfig} appConfig
 * @description Configuración global de la aplicación, que define los proveedores para el enrutamiento,
 * HTTP, autenticación y animaciones.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * @description Proveedor de enrutamiento que usa la configuración de rutas definida en `app.routes`.
     */
    provideRouter(routes),

    /**
     * @description Importa el módulo de animaciones del navegador, habilitando animaciones en la aplicación.
     */
    importProvidersFrom(BrowserAnimationsModule),

    /**
     * @description Importa y registra el módulo de HTTP para permitir peticiones HTTP en toda la aplicación.
     */
    importProvidersFrom(HttpClientModule), 

    /**
     * @description Proveedor de `HttpClient` para realizar peticiones HTTP, configurado para admitir `fetch` en vez de `XMLHttpRequest`.
     */
    provideHttpClient(withFetch()),

  ]
};
