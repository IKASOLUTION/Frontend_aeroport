import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, filter, take, throwError, BehaviorSubject, tap, finalize } from 'rxjs';
import { AuthServerProvider } from '../auth/auth-jwt.service';
import { LoginService } from '../auth/login.service';
import { LoadingService } from './loading.service';


let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
const EXCLUDED_URLS = [
  '/api/users/refresh',
  // Ajoutez d'autres URLs si nécessaire
];
export const UnifiedAuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authServerProvider = inject(AuthServerProvider);
  const loginService = inject(LoginService);
  const loadingService = inject(LoadingService);
  const shouldShowSpinner = !EXCLUDED_URLS.some(url => req.url.includes(url));

  // Ajouter le token d'authentification à la requête
  const authReq = addAuthToken(req, authServerProvider);
  if (shouldShowSpinner) {
    loadingService.show();
  }


  return next(authReq).pipe(
    tap({
      next: (event) => {
        
      },
      error: (err) => {
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {

        
        const refreshToken = authServerProvider.getRefreshToken();

        
        if (refreshToken && !isRefreshEndpoint(authReq.url)) {
          return handle401Error(authReq, next, authServerProvider, loginService, loadingService);
        } else {
          
          console.log('Token invalide ou expiré, déconnexion...');
          loginService.logout();
           // Forcer la fermeture du spinner en cas de déconnexion
           loadingService.forceHide();
        }
      }else {
        // Pour les autres erreurs, ne pas forcer la déconnexion
        logNonAuthError(error, req.url);
      }

      return throwError(() => error);
    }),finalize(() => {
      // Cacher le spinner à la fin de la requête (succès ou erreur)
      if (shouldShowSpinner) {
        loadingService.hide();
      }
    })
  );
};

function addAuthToken(request: HttpRequest<any>, authServerProvider: AuthServerProvider): HttpRequest<any> {
  const token = authServerProvider.getAccessToken();
  
  if (token && shouldAddToken(request.url)) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return request;
}

function shouldAddToken(url: string): boolean {
  // Ne pas ajouter le token pour les endpoints d'authentification
  const excludedUrls = [
    '/api/users/login',
/*     '/api/users/register',
 */    '/api/users/refresh'
  ];

  return !excludedUrls.some(excludedUrl => url.includes(excludedUrl));
}

function isRefreshEndpoint(url: string): boolean {
  return url.includes('/api/users/refresh');
}

function logNonAuthError(error: HttpErrorResponse, url: string): void {
  const errorType = getErrorType(error);
  console.warn(`⚠️ ${errorType} (${error.status}) for ${url}:`, error.error?.message || error.message);
}

function getErrorType(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400: return 'Bad Request';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 422: return 'Validation Error';
    case 500: return 'Server Error';
    case 502: return 'Bad Gateway';
    case 503: return 'Service Unavailable';
    default: return 'HTTP Error';
  }
}


function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authServerProvider: AuthServerProvider,
  loginService: LoginService,
  loadingService: LoadingService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);
console.log("=====1111==============22========")
    return authServerProvider.refreshToken().pipe(
      switchMap((response: any) => {
        console.log("=====1111==========response============",response)
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        
        console.log('Token rafraîchi avec succès');
        // Refaire la requête avec le nouveau token
        return next(addAuthToken(request, authServerProvider));
      }) ,
      catchError((error) => {
        console.log("=====1111======================",error)
        isRefreshing = false;
        console.log('Échec du rafraîchissement du token, déconnexion...');
        loginService.logout();
       loadingService.forceHide();
        return throwError(() => error);
      }) 
    );
  } else {
    // Si un refresh est déjà en cours, attendre qu'il se termine
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(() => next(addAuthToken(request, authServerProvider)))
    );
  }
}