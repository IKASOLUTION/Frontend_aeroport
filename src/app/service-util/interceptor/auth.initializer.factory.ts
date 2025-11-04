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

      // Si aucun token, rediriger vers login
      if (!accessToken && !refreshToken) {
        router.navigate(['/admin/login']);
        resolve(true);
        return;
      }

      // Si refreshToken existe mais pas d'accessToken : tenter de rafraîchir
      if (!accessToken && refreshToken) {
        authServerProvider.refreshToken().pipe(
          map((response: any) => {
            console.log('Token rafraîchi au démarrage');
            return true;
          }),
          catchError((error) => {
            console.error('Échec du rafraîchissement au démarrage:', error);
            loginService.logout();
            router.navigate(['/admin/login']);
            return of(false);
          })
        ).subscribe({
          next: () => resolve(true),
          error: () => resolve(true)
        });
      } else {
        // Token présent : continuer
        resolve(true);
      }
    });
  };
};
