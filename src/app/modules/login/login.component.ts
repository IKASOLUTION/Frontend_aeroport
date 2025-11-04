import { Component, signal, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms'; 

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { LoginService } from 'src/app/service-util/auth/login.service';
import { StateStorageService } from 'src/app/service-util/auth/state-storage.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    FormsModule,
    RippleModule,
    ReactiveFormsModule,
    RouterModule,
    DialogModule
  ],
})
export class LoginComponent implements OnDestroy {
  // Signaux Angular
  authenticationError = signal(false);
  errorMessage = signal('Nom d\'utilisateur ou mot de passe incorrect');
  isLoading = signal(false);
  rememberMe = signal(true);
  modalMotDePasseOublieOuvert = signal(false);

  public form: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private loginService: LoginService,
    private stateStorageService: StateStorageService,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(3)])]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle Remember Me
   */
  toggleRememberMe(): void {
    this.rememberMe.update(value => !value);
  }

  /**
   * Ouvrir la modale de mot de passe oublié
   */
  ouvrirModal(): void {
    this.modalMotDePasseOublieOuvert.set(true);
  }

  /**
   * Fermer la modale de mot de passe oublié
   */
  fermerModal(): void {
    this.modalMotDePasseOublieOuvert.set(false);
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtenir le message d'erreur d'un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Ce champ est requis';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    return 'Champ invalide';
  }

  /**
   * Connexion
   */
  login(): void {
  console.log("==================this.form=============", this.form);
  
  if (this.form.valid) {
    this.isLoading.set(true);
    this.authenticationError.set(false);

    const credentials = {
      login: this.form.value.username,
      password: this.form.value.password,
      rememberMe: this.rememberMe()
    };
    
    console.log("==================credentials=============", credentials);

    this.loginService
      .login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('5. Connexion réussie - Réponse complète:', response);
          console.log('6. Vérification token:', this.loginService.getStoredAuthenticationToken());
          console.log('7. Vérification utilisateur:', this.loginService.getStoredUser());
          
          this.authenticationError.set(false);
          
          // Attendre que tout soit bien stocké avant la redirection
          setTimeout(() => {
            console.log('8. Début de la redirection');
            this.handleSuccessfulLogin();
          }, 100);
        },
        error: (error) => {
          console.error('Échec de la connexion:', error);
          this.authenticationError.set(true);
          this.handleLoginError(error);
          this.isLoading.set(false);
        }
      });
  } else {
    this.markFormGroupTouched();
  }
}

private handleSuccessfulLogin(): void {
  try {
    // Vérifier que l'utilisateur est bien authentifié avant de rediriger
    if (!this.loginService.isAuthenticated()) {
      console.error('Utilisateur non authentifié après login');
      this.authenticationError.set(true);
      this.errorMessage.set('Erreur d\'authentification. Veuillez réessayer.');
      this.isLoading.set(false);
      return;
    }

    console.log('9. Utilisateur authentifié, navigation vers dashboard');
    
    // Navigation simple et directe
    this.router.navigateByUrl('/admin/dashboard').then(
      (success) => {
        console.log('10. Navigation réussie:', success);
        this.isLoading.set(false);
        
        if (!success) {
          console.error('Navigation échouée, tentative de fallback');
          window.location.href = '/admin/dashboard';
        }
      },
      (error) => {
        console.error('11. Erreur navigation:', error);
        this.isLoading.set(false);
        // Fallback
        window.location.href = '/admin/dashboard';
      }
    );
  } catch (error) {
    console.error('Erreur lors de la redirection:', error);
    this.isLoading.set(false);
    window.location.href = '/admin/dashboard';
  }
}

  

  /**
   * Gère les erreurs de connexion
   */
  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.errorMessage.set('Nom d\'utilisateur ou mot de passe incorrect');
    } else if (error.status === 0) {
      this.errorMessage.set('Erreur de connexion au serveur');
    } else {
      this.errorMessage.set('Erreur de connexion. Veuillez réessayer.');
    }

    setTimeout(() => {
      const usernameField = document.getElementById('username');
      if (usernameField) {
        usernameField.focus();
      }
    }, 100);
  }

  /**
   * Marque tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });
  }

  /**
   * Navigation vers l'inscription
   */
  register(): void {
    this.router.navigate(['/inscription']);
  }

  /**
   * Demande de réinitialisation du mot de passe
   */
  requestResetPassword(): void {
    this.router.navigate(['/reset', 'request']);
  }
}