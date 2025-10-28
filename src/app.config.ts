import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID, APP_INITIALIZER, Injector } from '@angular/core';
import { provideRouter, withHashLocation, withPreloading, withInMemoryScrolling, withViewTransitions, PreloadAllModules, Router } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgxWebstorage, withLocalStorage, withSessionStorage } from 'ngx-webstorage';

import { UnifiedAuthInterceptor } from './service-util/interceptor/auth.interceptor';
import { authInitializerFactory } from './service-util/interceptor/auth.initializer.factory';
import { AuthServerProvider } from './service-util/auth/auth-jwt.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // HTTP client avec interceptor
    provideHttpClient(
      withInterceptors([UnifiedAuthInterceptor]),
      withFetch()
    ),

    // APP_INITIALIZER pour authentification au démarrage
{
  provide: APP_INITIALIZER,
  useFactory: (injector: Injector) => authInitializerFactory(
    injector.get(Router),          
    injector.get(AuthServerProvider) 
  ),
  deps: [Injector],
  multi: true
},


    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),

    // Animations async
    provideAnimationsAsync(),

    // Router avec hash, préchargement et scroll
    provideRouter(
      routes,
      withHashLocation(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions()
    ),

    // Locale française
    { provide: LOCALE_ID, useValue: 'fr-FR' },

    // Fournisseurs ngx-webstorage pour LocalStorage et SessionStorage
    // Enregistrer explicitement les fonctionnalités de stockage local et de session
    provideNgxWebstorage(
      withLocalStorage(),
      withSessionStorage()
    )
  ]
};
