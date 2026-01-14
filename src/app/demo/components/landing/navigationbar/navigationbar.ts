import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigationbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigationbar.html',
  styleUrl: './navigationbar.css',
})
export class Navigationbar {
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
}
