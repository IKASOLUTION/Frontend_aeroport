import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { Utilisateur } from '../../modeles/utilisateur';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profil.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilComponent {
  private donneesService = inject(DonneesService);
  // Simule un utilisateur connecté. Dans une vraie app, on utiliserait un service d'auth.
  utilisateurConnecte = signal<Utilisateur | undefined>(this.donneesService.getUtilisateurs().find(u => u.nom === 'BATIONO'));

  // --- Password Change Modal State ---
  isPasswordModalOpen = signal(false);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  openPasswordModal(): void {
    this.isPasswordModalOpen.set(true);
  }

  closePasswordModal(): void {
    this.isPasswordModalOpen.set(false);
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.update(v => !v);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  changePassword(): void {
    // Logique de changement de mot de passe à implémenter
    console.log("Changement de mot de passe...");
    this.closePasswordModal();
  }
}
