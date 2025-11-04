// loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;
  private showTimestamp: number | null = null;
  private minDisplayTime = 500; // en ms

  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);

    if (this.requestCount === 0) {
      const now = Date.now();
      const timeShown = now - (this.showTimestamp || now);

      const delay = Math.max(this.minDisplayTime - timeShown, 0);

      setTimeout(() => {
        // vérifier que personne d’autre n’a relancé un chargement entre-temps
        if (this.requestCount === 0) {
          this.loadingSubject.next(false);
          this.showTimestamp = null;
        }
      }, delay);
    }
  }

  // Force hide (utile en cas d'erreur critique)
  forceHide(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }
}