import { Injectable, isDevMode } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { StateStorageService } from './state-storage.service';
import { AccountService } from './account.service';

@Injectable({ providedIn: 'root' })
export class UserRouteAccessService implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService,
        private stateStorageService: StateStorageService,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const authorities = route.data['authorities'];
        
        // We need to call the checkLogin / and so the accountService.identity() function, to ensure,
        // that the client has a principal too, if they already logged in by the server.
        // This could happen on a page refresh.
        return this.checkLogin(authorities, state.url);
    }

    checkLogin(authorities: string[], url: string): Observable<boolean> {
        return this.accountService.identity().pipe(
            map(account => {
                // If no authorities are required, allow access
                if (!authorities || authorities.length === 0) {
                    return true;
                }

                // If user is authenticated
                if (account) {
                    const hasAnyAuthority = this.accountService.hasAnyAuthority(authorities);
                    if (hasAnyAuthority) {
                        return true;
                    }
                    if (isDevMode()) {
                        console.error('User has not any of required authorities: ', authorities);
                    }
                    return false;
                }

                // User is not authenticated
                this.stateStorageService.storeUrl(url);
                this.router.navigate(['accessdenied']);
                
                return false;
            })
        );
    }
}