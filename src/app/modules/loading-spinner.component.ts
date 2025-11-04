// loading-spinner.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '../service-util/interceptor/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div *ngIf="loadingService.loading$ | async" class="loading-overlay">
      <div class="loading-container">
        <p-progressSpinner 
          styleClass="custom-spinner"
          strokeWidth="6"
          animationDuration="1s">
        </p-progressSpinner>
        <p class="loading-text">Chargement...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      border-radius: 12px;
      min-width: 200px;
      min-height: 150px;
    }

    .loading-text {
      margin-top: 20px;
      color: #333;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
    }

    /* Styles pour le spinner PrimeNG */
    ::ng-deep .custom-spinner {
      width: 100px !important;
      height: 100px !important;
    }

    ::ng-deep .custom-spinner .p-progress-spinner-circle {
      stroke: #377b53 !important;
      animation: p-progress-spinner-blink 1s step-end infinite !important;
    }

    /* Animation de rotation pour s'assurer qu'elle fonctionne */
   @keyframes p-progress-spinner-blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  `]
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}