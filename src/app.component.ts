import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuComponent } from './composants/menu/menu.component';
import { EnteteComponent } from './composants/entete/entete.component';
import { filter } from 'rxjs/operators';
import { NotificationsGlobalesComponent } from './composants/notification/notification.component';
import { MenuService } from './services/menu.service';
import { AuthServerProvider } from './service-util/auth/auth-jwt.service';

@Component({
  selector: 'app-racine',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, MenuComponent, EnteteComponent, NotificationsGlobalesComponent],
})
export class AppComponent {
  private router = inject(Router);
  menuService = inject(MenuService);
  auth = inject(AuthServerProvider);
  private currentUrl = signal<string>('');
  
  // estPageAuth is true when the current route is an auth page AND the user is NOT authenticated
  estPageAuth = computed(() => (
    (this.currentUrl() === '/connexion' || this.currentUrl() === '/inscription') &&
    !this.auth.isAuthenticated()
  ));

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);

      // If the user navigates to an auth page but is already authenticated, redirect to root
      const url = event.urlAfterRedirects;
      if ((url === '/connexion' || url === '/inscription') && this.auth.isAuthenticated()) {
        console.debug('[AppComponent] utilisateur authentifié: redirection depuis', url, '-> /');
        // Schedule navigation in a microtask to avoid interfering with the current view transition
        Promise.resolve().then(() => {
          this.router.navigate(['/tableau-de-bord']).catch(err => {
            // Ignore AbortError caused by skipped view transitions, but log others
            if (err && err.name !== 'AbortError') {
              console.debug('[AppComponent] redirection échouée', err);
            }
          });
        });
        return;
      }
    });
  }
}
