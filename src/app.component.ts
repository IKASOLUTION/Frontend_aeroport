import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuComponent } from './composants/menu/menu.component';
import { EnteteComponent } from './composants/entete/entete.component';
import { filter } from 'rxjs/operators';
import { NotificationsGlobalesComponent } from './composants/notification/notification.component';
import { MenuService } from './services/menu.service';

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
  private currentUrl = signal<string>('');

  estPageAuth = computed(() => this.currentUrl() === '/connexion' || this.currentUrl() === '/inscription');

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }
}
