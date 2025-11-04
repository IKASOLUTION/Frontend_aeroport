import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Account } from 'src/app/demo/components/model/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userIdentity: Account | null = null;
    private authenticated = false;
    private authorities: string[] = [];
    private authenticationState = new Subject<Account | null>();

    constructor(private http: HttpClient, private router: Router) {}

    // Correction de la faute de frappe "autorities" -> "authorities"
    findAuthorities(): Observable<HttpResponse<string[]>> {
    return this.http.get<string[]>('/api/account/authorities', { observe: 'response' });
    }

    fetch(): Observable<HttpResponse<Account>> {
    return this.http.get<Account>('/api/users/account', { observe: 'response' });
    }
    
    updatePassword(newPassword: string, currentPassword: string): Observable<any> {
        console.log('Updating password...');
    return this.http.post('/api/users/account/change-password', { currentPassword, newPassword });
    }

    // Correction de la faute de frappe "reunitialise" -> "reinitialize"
    reinitialize(email: string, currentPassword: string): Observable<any> {
    return this.http.post('/api/users/account/reinitialize', { email, currentPassword });
    }

    save(account: Account): Observable<HttpResponse<any>> {
    return this.http.post('/api/account', account, { observe: 'response' });
    }

    authenticate(identity: Account | null): void {
        this.userIdentity = identity;
        this.authenticated = identity !== null;
        this.authorities = identity?.authorities || [];
        this.authenticationState.next(this.userIdentity);
    }

    hasAnyAuthority(authorities: string[]): boolean {
        if (!this.authenticated || !this.userIdentity?.authorities) {
            return false;
        }

        return authorities.some(authority => 
            this.userIdentity!.authorities.includes(authority)
        );
    }

    hasAuthority(authority: string): Observable<boolean> {
        return this.identity().pipe(
            map(identity => identity?.authorities?.includes(authority) || false),
            catchError(() => of(false))
        );
    }

    // Méthode corrigée pour vérifier les rôles
    hasRole(authority: string): boolean {
        if (!this.authenticated || !this.userIdentity) {
            return false;
        }
        return this.userIdentity.authorities?.includes(authority) || false;
    }

    // Méthode Observable pour vérifier l'authentification
    checkAuthentication(): Observable<boolean> {
        return this.identity().pipe(
            map(identity => identity !== null),
            catchError(() => of(false))
        );
    }

    identity(force?: boolean): Observable<Account | null> {
        if (force) {
            this.userIdentity = null;
        }

        // Retourner l'identité en cache si elle existe
        if (this.userIdentity && !force) {
            return new Observable(observer => {
                observer.next(this.userIdentity);
                observer.complete();
            });
        }

        return new Observable(observer => {
            this.fetch().subscribe({
                next: (response) => {
                    const account = response?.body;
                    
                    if (account) {
                        this.userIdentity = account;
                        this.authenticated = true;
                        this.authorities = account.authorities || [];
                    } else {
                        this.resetAuthenticationState();
                    }
                    
                    this.authenticationState.next(this.userIdentity);
                    observer.next(this.userIdentity);
                    observer.complete();
                },
                error: (error) => {
                    console.error('Error fetching user identity:', error);
                    this.resetAuthenticationState();
                    this.router.navigate(['/connexion']);
                    observer.next(null);
                    observer.complete();
                }
            });
        });
    }

    private resetAuthenticationState(): void {
        this.userIdentity = null;
        this.authenticated = false;
        this.authorities = [];
        this.authenticationState.next(null);
    }

    isAuthenticated(): boolean {
        return this.authenticated;
    }

    isIdentityResolved(): boolean {
        return this.userIdentity !== undefined;
    }

    getAuthenticationState(): Observable<Account | null> {
        return this.authenticationState.asObservable();
    }

    getImageUrl(): string {
        return this.userIdentity?.imageUrl || '';
    }

    // Méthodes utilitaires supplémentaires
    getCurrentUser(): Account | null {
        return this.userIdentity;
    }

    getUserAuthorities(): string[] {
        return this.authorities;
    }

    logout(): void {
        this.resetAuthenticationState();
        this.router.navigate(['/admin/login']);
    }
}