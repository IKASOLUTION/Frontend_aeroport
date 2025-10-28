import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthServerProvider } from '../auth/auth-jwt.service';

export function authInitializerFactory(
  router: Router,
  authServerProvider: AuthServerProvider
): () => Promise<boolean> {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const accessToken = authServerProvider.getAccessToken();
      const refreshToken = authServerProvider.getRefreshToken();

      // Preferer vérifier la validité via isAuthenticated() (contrôle d'expiration)
      const isAuthenticated = authServerProvider.isAuthenticated();

      console.log('🔐 Initialisation auth — accessToken present?', !!accessToken, 'refreshToken?', !!refreshToken, 'isAuthenticated?', isAuthenticated);

      // Si le token est valide, on ne redirige pas vers /connexion
      if (isAuthenticated) {
        console.log('✅ Token valide détecté — pas de redirection vers /connexion');
        resolve(true);
        return;
      }

      // Aucun token et aucun refresh token => redirection vers connexion
      if (!accessToken && !refreshToken) {
        console.log('ℹ️ Aucun token ni refresh token — redirection vers /connexion');
        router.navigate(['/connexion']).then(() => resolve(true));
        return;
      }

      // Si le token est absent ou invalide mais qu'on a un refreshToken, tenter de rafraîchir
      if (refreshToken) {
        console.log('🔄 Tentative de rafraîchissement du token au démarrage...');

        authServerProvider.refreshToken().pipe(
          map(() => {
            console.log('✅ Token rafraîchi au démarrage');
            return true;
          }),
          catchError((error) => {
            console.error('❌ Échec du rafraîchissement au démarrage:', error);
            // Nettoyage basique
            authServerProvider.clearTokens();
            router.navigate(['/connexion']);
            return of(false);
          })
        ).subscribe({
          next: (success) => resolve(success),
          error: () => resolve(true),
        });
        return;
      }

      // Cas par défaut (token présent mais invalide et pas de refreshToken) => redirection
      console.log('⚠️ Token présent mais invalide et pas de refresh token — redirection');
      authServerProvider.clearTokens();
      router.navigate(['/connexion']).then(() => resolve(true));
    });
  };
}