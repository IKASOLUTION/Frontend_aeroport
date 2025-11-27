import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { UserService } from 'src/app/store/user/service';
import * as userAction from '../../../store/user/action';
import * as userSelector from '../../../store/user/selector';

import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { LoginService } from 'src/app/service-util/auth/login.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // PrimeNG
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    DialogModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  providers: [MessageService]
})
export class AuthComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotPasswordForm!: FormGroup;

  activeView: 'login' | 'register' | 'forgot' = 'login';
  displayForgotModal: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private loginService: LoginService,
    private store: Store<AppState>,
  ) { }

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    // Formulaire de connexion
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulaire d'inscription
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s]+$/)]],
      terms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });

    // Formulaire de récupération de mot de passe
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.loading = true;

      // Simuler un appel API
     


      const credentials = {
      login: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: true,
      type: "PASSAGER"
    };
    
        this.loginService.login(credentials).subscribe((res)=>{

          console.log("===============================",res)
           setTimeout(() => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: 'Bienvenue sur NEYWAONGO',
          life: 3000
        });
        })
         console.log('Login data:', this.loginForm.value);
      });
        // TODO: Implémenter la logique de connexion réelle
       
    } else {
      this.markFormGroupTouched(this.loginForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs correctement',
        life: 3000
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.loading = true;

      console.log('Dispatching createUser action with:', this.registerForm.value);
      // Simuler un appel API
      setTimeout(() => {
        
        this.messageService.add({
          severity: 'success',
          summary: 'Inscription réussie',
          detail: 'Votre compte a été créé avec succès',
          life: 3000
        });

          this.store.dispatch(userAction.createUser(this.registerForm.value));
       

        // TODO: Implémenter la logique d'inscription réelle
        console.log('Register data:', this.registerForm.value);
        this.activeView = 'login';
      }, 1500);
    } else {
      this.markFormGroupTouched(this.registerForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs correctement',
        life: 3000
      });
    }
  }

  onForgotPassword(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;

      // Simuler un appel API
      setTimeout(() => {
        this.loading = false;
        this.displayForgotModal = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Email envoyé',
          detail: 'Un lien de réinitialisation a été envoyé à votre adresse email',
          life: 3000
        });

        // TODO: Implémenter la logique de réinitialisation réelle
        console.log('Forgot password data:', this.forgotPasswordForm.value);
        this.forgotPasswordForm.reset();
      }, 1500);
    } else {
      this.markFormGroupTouched(this.forgotPasswordForm);
    }
  }

  switchView(view: 'login' | 'register' | 'forgot'): void {
    this.activeView = view;
    this.resetForms();
  }

  openForgotModal(): void {
    this.displayForgotModal = true;
  }

  closeForgotModal(): void {
    this.displayForgotModal = false;
    this.forgotPasswordForm.reset();
  }

  resetForms(): void {
    this.loginForm.reset();
    this.registerForm.reset();
    this.forgotPasswordForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);

    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('email')) {
      return 'Email invalide';
    }
    if (field?.hasError('minlength')) {
      return 'Minimum 6 caractères requis';
    }
    if (field?.hasError('pattern')) {
      return 'Format invalide';
    }
    if (fieldName === 'confirmPassword' && form.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }

    return '';
  }
}