import { ChangeDetectionStrategy, Component, inject, signal, ElementRef } from '@angular/core';
import { DonneesService } from '../../services/donnees.service';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-entete',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './entete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:fullscreenchange)': 'onFullscreenChange()',
  }
})
export class EnteteComponent {
  private donneesService = inject(DonneesService);
  private elementRef = inject(ElementRef);
  menuService = inject(MenuService);

  notificationsDropdownOuvert = signal(false);
  profilDropdownOuvert = signal(false);
  isFullscreen = signal(!!document.fullscreenElement);
  
  notifications = signal(this.donneesService.getAlertes().slice(0, 3));

  toggleMenu(): void {
    this.menuService.toggleMenu();
  }

  toggleNotificationsDropdown(): void {
    this.notificationsDropdownOuvert.update(ouvert => !ouvert);
    if (this.notificationsDropdownOuvert()) {
      this.profilDropdownOuvert.set(false);
    }
  }

  closeNotificationsDropdown(): void {
    this.notificationsDropdownOuvert.set(false);
  }

  toggleProfilDropdown(): void {
    this.profilDropdownOuvert.update(ouvert => !ouvert);
    if (this.profilDropdownOuvert()) {
      this.notificationsDropdownOuvert.set(false);
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.notificationsDropdownOuvert.set(false);
      this.profilDropdownOuvert.set(false);
    }
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }
}