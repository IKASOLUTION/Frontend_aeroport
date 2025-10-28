import { Injectable, inject } from '@angular/core';
import { AccountService } from './account.service';
import { AuthServerProvider } from './auth-jwt.service';
import { catchError, Observable, switchMap, tap, throwError, of } from 'rxjs';
import { Utilisateur } from '../../modeles/utilisateur';
import { Injector } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginService {
    private accountService = inject(AccountService);

    private injector = inject(Injector);

  private get authServerProvider(): AuthServerProvider {
    return this.injector.get(AuthServerProvider);
  }
    login(credentials: any): Observable<any> {
        return this.authServerProvider.login(credentials).pipe(
            tap((response: any) => {
                console.log('✅ Données de connexion reçues:', response);
            }),
            switchMap((response: any) => {
                // Récupérer et mettre à jour l'identité de l'utilisateur
                return this.accountService.identity(true).pipe(
                    tap((account) => {
                        console.log('✅ Compte utilisateur récupéré:', account);
                        if (account) {
                            localStorage.setItem('UTILISATEUR_KEY', JSON.stringify(account));
                        }
                    }),
                    // Retourner la réponse de connexion originale
                    switchMap(() => of(response))
                );
            }), 
            catchError((error) => {
                console.error('❌ Erreur lors de la connexion:', error);
                this.logout();
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        try {
            this.authServerProvider.logout();
            this.accountService.authenticate(null);
            localStorage.removeItem('UTILISATEUR_KEY');
            console.log('✅ Déconnexion effectuée avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        }
    }

    isAuthenticated(): boolean {
        return this.authServerProvider.isAuthenticated();
    }

    get isAuthenticated$(): Observable<boolean> {
        return this.authServerProvider.isAuthenticated$;
    }

    getStoredUser(): Utilisateur | null {
        const userJson = localStorage.getItem('UTILISATEUR_KEY');
        return userJson ? JSON.parse(userJson) as Utilisateur : null;
    }

    getCurrentUser(): any {
        return this.authServerProvider.getUserInfo();
    }

    refreshAuthToken(): Observable<any> {
        return this.authServerProvider.refreshToken().pipe(
            catchError((error) => {
                console.error('❌ Erreur lors du rafraîchissement du token:', error);
                this.logout();
                return throwError(() => error);
            })
        );
    }

    getStoredAuthenticationToken(): string | null {
        return this.authServerProvider.getAccessToken();
    }

    getRefreshToken(): string | null {
        return this.authServerProvider.getRefreshToken();
    }

    getAuthHeaders() {
        return this.authServerProvider.getAuthHeaders();
    }
}