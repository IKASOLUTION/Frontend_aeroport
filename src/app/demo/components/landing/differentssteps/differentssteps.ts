import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-differentssteps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './differentssteps.html',
  styleUrl: './differentssteps.css',
})
export class Differentssteps implements AfterViewInit {
  @ViewChild('target', { static: true }) target!: ElementRef;
  isVisible = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    // ✅ Run ONLY in browser
    if (!isPlatformBrowser(this.platformId)) return;

    // ✅ Fallback for old browsers
    if (!('IntersectionObserver' in window)) {
      this.isVisible = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (this.target) {
      observer.observe(this.target.nativeElement);
    }
  }
}
