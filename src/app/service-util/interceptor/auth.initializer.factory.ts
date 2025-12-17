import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthServerProvider } from '../auth/auth-jwt.service';
import { LoginService } from '../auth/login.service';

export const authInitializerFactory = (): (() => Promise<boolean>) => {
  const router = inject(Router);
  const store = inject(Store);
  const authServerProvider = inject(AuthServerProvider);
  const loginService = inject(LoginService);

  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const accessToken = authServerProvider.getAccessToken();
      const refreshToken = authServerProvider.getRefreshToken();
      
      // Récupère l'URL cible depuis le navigateur
      const targetUrl = window.location.pathname;

      // Si aucun token
      if (!accessToken && !refreshToken) {
        // Si l'utilisateur essaie d'accéder à une route admin
        if (targetUrl.startsWith('/admin') && targetUrl !== '/admin/login') {
          router.navigate(['/admin/login'], { 
            queryParams: { returnUrl: targetUrl } 
          });
        }
        // Sinon, laisser le routing normal s'effectuer
        resolve(true);
        return;
      }

      // Si refreshToken existe mais pas d'accessToken → essayer de rafraîchir
      if (!accessToken && refreshToken) {
        authServerProvider.refreshToken().pipe(
          map((response: any) => {
            console.log('Token rafraîchi au démarrage');
            // Après refresh réussi, laisser l'utilisateur accéder à sa route
            return true;
          }),
          catchError((error) => {
            console.error('Échec du rafraîchissement au démarrage:', error);
            loginService.logout();

            // Si tentative admin
            if (targetUrl.startsWith('/admin') && targetUrl !== '/admin/login') {
              router.navigate(['/admin/login'], { 
                queryParams: { returnUrl: targetUrl } 
              });
            } else if (targetUrl.startsWith('/site-aeroport')) {
              // L'utilisateur est déjà sur le site, ne pas rediriger
            } else {
              router.navigate(['/site-aeroport/accueil']);
            }

            return of(false);
          })
        ).subscribe({
          next: () => resolve(true),
          error: () => resolve(true)
        });
      } else {
        // accessToken existe, laisser passer
        // Optionnel : vous pourriez vérifier si le token est expiré ici
        resolve(true);
      }
    });
  };
};