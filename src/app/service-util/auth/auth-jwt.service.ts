import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtToken } from 'src/app/demo/service/auth.service';
import { Router } from '@angular/router';


@Injectable({ providedIn: 'root' })
export class AuthServerProvider {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
      private http: HttpClient,
      private localStorage: LocalStorageService,
      private sessionStorage: SessionStorageService,
      private router: Router
  ) {}

  /**
   * Stocke les tokens d'authentification
   */
  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
      if (rememberMe) {
          // Utiliser localStorage pour une session persistante
          this.localStorage.store(this.ACCESS_TOKEN_KEY, accessToken);
          this.localStorage.store(this.REFRESH_TOKEN_KEY, refreshToken);
      } else {
          // Utiliser sessionStorage pour une session temporaire
          this.sessionStorage.store(this.ACCESS_TOKEN_KEY, accessToken);
          this.sessionStorage.store(this.REFRESH_TOKEN_KEY, refreshToken);
      }

      this.isAuthenticatedSubject.next(true);
  }

  /**
   * Récupère le token d'accès
   */
  getAccessToken(): string | null {
      return this.localStorage.retrieve(this.ACCESS_TOKEN_KEY) ||
             this.sessionStorage.retrieve(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Récupère le token de rafraîchissement
   */
  getRefreshToken(): string | null {
      return this.localStorage.retrieve(this.REFRESH_TOKEN_KEY) ||
             this.sessionStorage.retrieve(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
      return this.hasValidToken();
  }

  /**
   * Vérifie la validité du token JWT
   */
  private hasValidToken(): boolean {
      const token = this.getAccessToken();
      if (!token) {
          return false;
      }

      try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const isValid = payload.exp > currentTime;

          if (!isValid) {
              this.clearTokens();
          }

          return isValid;
      } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);
          this.clearTokens();
          return false;
      }
  }

  /**
   * Génère les en-têtes d'authentification
   */
  getAuthHeaders(): HttpHeaders {
      const token = this.getAccessToken();
      if (!token) {
          return new HttpHeaders({
              'Content-Type': 'application/json'
          });
      }

      return new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      });
  }

  /**
   * Authentifie l'utilisateur
   */
  login(credentials: any): Observable<any> {
      const data = {
          login: credentials.login,
          password: credentials.password,
          rememberMe: credentials.rememberMe || false
      };

      return this.http.post('api/users/login', data).pipe(
          tap((response: any) => {
              if (response.body.accessToken && response.body.refreshToken) {
                console.log('Réponse de connexion accessToken:', response.body.accessToken, response.body.refreshToken);
                  this.setTokens(
                      response.body.accessToken,
                      response.body.refreshToken,
                      credentials.rememberMe || false
                  );
              }
          }),
          catchError((error) => {
              console.error('Erreur lors de la connexion:', error);
              return throwError(() => error);
          })
      );
  }

  /**
   * Rafraîchit le token d'accès
   */
  refreshToken(): Observable<any> {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
      
          this.logout();
          return throwError(() => new Error('Aucun token de rafraîchissement disponible'));
      }
      return this.http.post('api/users/refresh', {
          refreshToken: refreshToken
      }).pipe(
          tap((response: any) => {
              if (response.accessToken && response.refreshToken) {
                  const rememberMe = !!this.localStorage.retrieve(this.ACCESS_TOKEN_KEY);
                  this.setTokens(response.accessToken, response.refreshToken, rememberMe);
              }
          }),
          catchError((error) => {
              console.log('Erreur lors du rafraîchissement du token:', error);
              this.logout();
              return throwError(() => error);
          })
      );
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    console.log('Déconnexion en cours...====================');
      // Optionnel : appeler l'API de déconnexion
     /*  const refreshToken = this.getRefreshToken();
      if (refreshToken) {
          this.http.post('api/users/logout', { refreshToken: refreshToken })
              .subscribe({
                  next: () => console.log('Déconnexion réussie côté serveur'),
                  error: (error) => console.error('Erreur lors de la déconnexion côté serveur:', error)
              });
      } */

      this.clearTokens();
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/admin/login']);
  }

   logoutSite(): void {
    console.log('Déconnexion en cours...====================');
      // Optionnel : appeler l'API de déconnexion
     

      this.clearTokens();
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/site-aeroport/auth']);
  }

  /**
   * Supprime tous les tokens stockés
   */
  private clearTokens(): void {
      this.localStorage.clear(this.ACCESS_TOKEN_KEY);
      this.localStorage.clear(this.REFRESH_TOKEN_KEY);
      this.sessionStorage.clear(this.ACCESS_TOKEN_KEY);
      this.sessionStorage.clear(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Récupère les informations de l'utilisateur depuis le token
   */
  getUserInfo(): any {
      const token = this.getAccessToken();
      if (!token) {
          return null;
      }

      try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
              userId: payload.sub,
              username: payload.username || payload.login,
              email: payload.email,
              roles: payload.roles || [],
              exp: payload.exp
          };
      } catch (error) {
          console.error('Erreur lors du décodage du token:', error);
          return null;
      }
  }
}
