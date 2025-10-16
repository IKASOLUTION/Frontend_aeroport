import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }
}
