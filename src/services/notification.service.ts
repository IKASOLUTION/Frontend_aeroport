import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration: number = 4000): void {
    const id = this.nextId++;
    const newNotification: Notification = { id, message, type };
    
    this.notifications.update(currentNotifications => [...currentNotifications, newNotification]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number): void {
    this.notifications.update(currentNotifications => 
      currentNotifications.filter(n => n.id !== id)
    );
  }
}
