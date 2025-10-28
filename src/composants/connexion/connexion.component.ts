import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoginService } from './../../service-util/auth/login.service';
import { StateStorageService } from './../../service-util/auth/state-storage.service';


@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './connexion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnexionComponent {
  private router = inject(Router);
  private loginService = inject(LoginService);
  private stateStorageService = inject(StateStorageService);
  private fb = inject(FormBuilder);

  form: FormGroup;
  rememberMe = signal(true);
  authenticationError = signal(false);
  isLoading = signal(false);
  modalMotDePasseOublieOuvert = signal(false);
  errorMessage = signal('');
  
  private destroy$ = new Subject<void>();

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

 
  login(): void {
    
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.authenticationError.set(false);
    this.errorMessage.set('');

    const credentials = {
      login: this.form.value.username,
      password: this.form.value.password,
      rememberMe: this.rememberMe()
    };

    this.loginService
      .login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Connexion réussie');
          this.authenticationError.set(false);
          this.handleSuccessfulLogin();
        },
        error: (error) => {
          console.error('❌ Échec de la connexion:', error);
          this.handleLoginError(error);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }

  private handleSuccessfulLogin(): void {
    try {
      const redirectUrl = this.stateStorageService.getUrl();
      
      if (redirectUrl && redirectUrl !== '/connexion') {
        this.stateStorageService.storeUrl('');
        console.log('Redirection vers:', redirectUrl);
        this.router.navigate([redirectUrl]);
        return;
      }

      const currentUrl = this.router.url;
      const shouldRedirectToHome = ['/connexion', '/inscription'].includes(currentUrl) || 
        /^\/activate\//.test(currentUrl) || 
        /^\/reset\//.test(currentUrl);

      if (shouldRedirectToHome) {
        console.log('Redirection vers le tableau de bord');
        this.router.navigate(['/tableau-de-bord']);
      }
    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
      this.router.navigate(['/tableau-de-bord']);
    }
  }

  private handleLoginError(error: any): void {
    this.authenticationError.set(true);
    this.isLoading.set(false);

    if (error.status === 401) {
      this.errorMessage.set('Identifiants invalides. Veuillez vérifier votre email et mot de passe.');
    } else if (error.status === 0) {
      this.errorMessage.set('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    } else {
      this.errorMessage.set('Erreur de connexion. Veuillez réessayer plus tard.');
    }

    setTimeout(() => {
      const usernameField = document.getElementById('username');
      usernameField?.focus();
    }, 100);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  toggleRememberMe(): void {
    this.rememberMe.update(val => !val);
  }

  ouvrirModal(): void {
    this.modalMotDePasseOublieOuvert.set(true);
  }

  fermerModal(): void {
    this.modalMotDePasseOublieOuvert.set(false);
  }

  register(): void {
    this.router.navigate(['/inscription']);
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Ce champ est requis';
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}