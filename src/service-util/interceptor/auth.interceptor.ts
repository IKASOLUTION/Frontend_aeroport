import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, filter, take, throwError, BehaviorSubject, finalize } from 'rxjs';
import { AuthServerProvider } from '../auth/auth-jwt.service';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

const EXCLUDED_URLS = [
  '/api/users/refresh',
  '/api/users/login',
];

const AUTH_EXCLUDED_URLS = [
  '/api/users/login',
  '/api/users/refresh'
];

export const UnifiedAuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authServerProvider = inject(AuthServerProvider);
  const router = inject(Router);
  const loadingService = inject(LoadingService);
  
  const shouldShowSpinner = !EXCLUDED_URLS.some(url => req.url.includes(url));

  // Ajouter le token d'authentification
  const authReq = addAuthToken(req, authServerProvider);
  
  if (shouldShowSpinner) {
    loadingService.show();
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = authServerProvider.getRefreshToken();

        if (refreshToken && !isRefreshEndpoint(authReq.url)) {
          return handle401Error(authReq, next, authServerProvider, router, loadingService);
        } else {
          console.log('❌ Token invalide ou expiré, déconnexion...');
          handleLogout(authServerProvider, router, loadingService);
        }
      } else {
        logNonAuthError(error, req.url);
      }

      return throwError(() => error);
    }),
    finalize(() => {
      if (shouldShowSpinner) {
        loadingService.hide();
      }
    })
  );
};

function addAuthToken(request: HttpRequest<any>, authServerProvider: AuthServerProvider): HttpRequest<any> {
  const token = authServerProvider.getAccessToken();

  // Debug logs to help trace why Authorization may be missing or rejected by backend
  try {
    if (token) {
      const short = token.length > 10 ? token.substring(0, 10) + '...' : token;
      console.debug(`[AuthInterceptor] token found (${short}) for ${request.url}`);
    } else {
      console.debug(`[AuthInterceptor] no token found for ${request.url}`);
    }
  } catch (e) {
    console.debug('[AuthInterceptor] error reading token for debug:', e);
  }

  if (token && shouldAddToken(request.url)) {
    const cloned = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.debug(`[AuthInterceptor] added Authorization header for ${request.url}`);
    return cloned;
  }

  return request;
}

function shouldAddToken(url: string): boolean {
  return !AUTH_EXCLUDED_URLS.some(excludedUrl => url.includes(excludedUrl));
}

function isRefreshEndpoint(url: string): boolean {
  return url.includes('/api/users/refresh');
}

function logNonAuthError(error: HttpErrorResponse, url: string): void {
  const errorType = getErrorType(error);
  console.warn(`⚠️ ${errorType} (${error.status}) pour ${url}:`, error.error?.message || error.message);
}

function getErrorType(error: HttpErrorResponse): string {
  const errorMap: Record<number, string> = {
    400: 'Requête incorrecte',
    403: 'Accès interdit',
    404: 'Non trouvé',
    409: 'Conflit',
    422: 'Erreur de validation',
    500: 'Erreur serveur',
    502: 'Passerelle incorrecte',
    503: 'Service indisponible'
  };
  
  return errorMap[error.status] || 'Erreur HTTP';
}

function handleLogout(
  authServerProvider: AuthServerProvider,
  router: Router,
  loadingService: LoadingService
): void {
  authServerProvider.logout();
  localStorage.removeItem('UTILISATEUR_KEY');
  loadingService.forceHide();
  router.navigate(['/connexion']);
}

function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authServerProvider: AuthServerProvider,
  router: Router,
  loadingService: LoadingService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authServerProvider.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        const newToken = response.accessToken;
        refreshTokenSubject.next(newToken);
        
        console.log('✅ Token rafraîchi avec succès');
        return next(addAuthToken(request, authServerProvider));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        
        console.log('❌ Échec du rafraîchissement du token, déconnexion...');
        handleLogout(authServerProvider, router, loadingService);
        
        return throwError(() => error);
      })
    );
  } else {
    // Attendre que le refresh en cours se termine
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next(addAuthToken(request, authServerProvider)))
    );
  }

  
}