import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-globales',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsGlobalesComponent {
  notificationService = inject(NotificationService);

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fa-solid fa-check-circle';
      case 'error': return 'fa-solid fa-xmark-circle';
      case 'warning': return 'fa-solid fa-exclamation-triangle';
      case 'info': return 'fa-solid fa-info-circle';
      default: return '';
    }
  }

  getContainerClass(type: string): string {
     switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-800';
    }
  }
}
