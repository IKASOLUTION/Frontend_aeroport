import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-connexion-sdk',
  standalone: true,
  templateUrl: './connexion-sdk.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnexionSdkComponent {
  private notificationService = inject(NotificationService);

  isRegularSdkConnected = signal(false);
  isKojakSdkConnected = signal(false);

  toggleRegularSdk(): void {
    this.isRegularSdkConnected.update(value => !value);
    const message = this.isRegularSdkConnected()
      ? 'SDK Regular connecté avec succès.'
      : 'SDK Regular déconnecté.';
    const type = this.isRegularSdkConnected() ? 'success' : 'info';
    this.notificationService.show(message, type);
  }

  toggleKojakSdk(): void {
    this.isKojakSdkConnected.update(value => !value);
    const message = this.isKojakSdkConnected()
      ? 'SDK KOJAK BIOMETRIQUE connecté avec succès.'
      : 'SDK KOJAK BIOMETRIQUE déconnecté.';
    const type = this.isKojakSdkConnected() ? 'success' : 'info';
    this.notificationService.show(message, type);
  }
}
