import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { AuthServerProvider } from './auth-jwt.service';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { User } from 'src/app/store/user/model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginService {
    constructor(
        private accountService: AccountService,
        private router: Router,
        private authServerProvider: AuthServerProvider
    ) { }

    login(credentials: any): Observable<any> {
        return this.authServerProvider.login(credentials).pipe(
            tap((response: any) => {
                console.log('Données de connexion reçues:', response , credentials);
                if(credentials.type =="PASSAGER") {
                    this.router.navigateByUrl('/site-aeroport/accueil');

                } else {
                
                    this.router.navigateByUrl('/admin/dashboard');
                }
                
            }),
            switchMap((response: any) => {
                // Récupérer et mettre à jour l'identité de l'utilisateur
                return this.accountService.identity(true).pipe(
                    tap((account) => {
                        console.log('Compte utilisateur récupéré:', account);



                        if (account) {
                            localStorage.setItem('UTILISATEUR_KEY', JSON.stringify(account));
                        }





                    }),
                    // Retourner la réponse de connexion originale
                    switchMap(() => new Observable<any>(observer => {
                        observer.next(response);
                        observer.complete();
                    }))
                );
            }),
            catchError((error) => {
                console.error('Erreur lors de la connexion:', error);
                if (credentials.type =="PASSAGER") {
                    console.error('Identifiants invalides');
                    this.logoutSite();
                } else {
                this.logout();
                }
               
                return throwError(() => error);
            })
        );
    }

   
    logout(): void {
        try {
            // Déconnexion via AuthServerProvider (gère tout le nettoyage)
            //this.authServerProvider.logout();

            // Réinitialiser l'état d'authentification dans AccountService
            this.accountService.authenticate(null);
            this.accountService.logout();


            console.log('Déconnexion effectuée avec succès');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }

    logoutSite(): void {
        try {
            // Déconnexion via AuthServerProvider (gère tout le nettoyage)
            this.authServerProvider.logoutSite();

            // Réinitialiser l'état d'authentification dans AccountService
            this.accountService.authenticate(null);
            this.accountService.logoutSite();


            console.log('Déconnexion effectuée avec succès');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }

    /**
     * Vérifie si l'utilisateur est connecté
     */
    isAuthenticated(): boolean {
        return this.authServerProvider.isAuthenticated();
    }

    /**
     * Observable pour surveiller l'état d'authentification
     */
    get isAuthenticated$(): Observable<boolean> {
        return this.authServerProvider.isAuthenticated$;
    }





    getStoredUser(): User | null {
        const userJson = localStorage.getItem('UTILISATEUR_KEY');
        return userJson ? JSON.parse(userJson) as User : null;
    }

    /**
     * Récupère les informations de l'utilisateur connecté
     */
    getCurrentUser(): any {
        return this.authServerProvider.getUserInfo();
    }

    /**
     * Rafraîchit le token d'authentification
     */
    refreshAuthToken(): Observable<any> {
        return this.authServerProvider.refreshToken().pipe(
            catchError((error) => {
                console.error('Erreur lors du rafraîchissement du token:', error);
                this.logout();
                return throwError(() => error);
            })
        );
    }

    /**
     * Récupère le token d'accès stocké
     */
    getStoredAuthenticationToken(): string | null {
        return this.authServerProvider.getAccessToken();
    }

    /**
     * Récupère le token de rafraîchissement
     */
    getRefreshToken(): string | null {
        return this.authServerProvider.getRefreshToken();
    }

    /**
     * Génère les en-têtes d'authentification
     */
    getAuthHeaders() {
        return this.authServerProvider.getAuthHeaders();
    }
}