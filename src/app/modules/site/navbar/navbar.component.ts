import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { AuthServerProvider } from 'src/app/service-util/auth/auth-jwt.service';
import { LoginService } from 'src/app/service-util/auth/login.service';




@Component({
  selector: 'app-navbar',
  standalone: true,
  imports:[
    CommonModule,
    RouterModule,
    ButtonModule,
    RippleModule,
    StyleClassModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
   
})
export class NavbarComponent implements OnInit {
  private readonly auth = inject(AuthServerProvider);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isAuthenticated = signal(false);
  isAuthenticated$!: Observable<boolean>;

  ngOnInit(): void {
    // Écouter l'état d'authentification depuis le service
    this.auth.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuth => {
        this.isAuthenticated.set(isAuth);
      });
  }

  logout(): void {
    this.loginService.logout();
    this.isAuthenticated.set(false);
    this.router.navigate(['/site-aeroport/accueil']);
  }
}




