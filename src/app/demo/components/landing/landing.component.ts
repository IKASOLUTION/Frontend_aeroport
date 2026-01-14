import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer/footer';
import { Differentssteps } from './differentssteps/differentssteps';
import { Faq } from './faq/faq';
import { Navigationbar } from './navigationbar/navigationbar';
import { Popupdifferentsteps } from './popupdifferentsteps/popupdifferentsteps';
import { Upcomingevents } from './upcomingevents/upcomingevents';
import { HeroSliderComponent } from './hero-slider/hero-slider';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Footer,
    Differentssteps,
    Faq,
    Navigationbar,
    Popupdifferentsteps,
    Upcomingevents,
    HeroSliderComponent,
  ],
  standalone: true,
  template:
    '   <app-popupdifferentsteps  (closed)="onModalClosed()" (confirmed)="onModalConfirmed()" ></ app-popupdifferentsteps> <app-navigationbar /> <app-hero-slider/> <app-differentssteps /> <app-upcomingevents /><app-faq /> <app-footer /> ',
})
export class LandingComponent {
  protected readonly title = signal('airportProject');
  onModalClosed(): void {
    console.log('Modal was closed');
    // Add your logic here
  }

  onModalConfirmed(): void {
    console.log('User confirmed the modal');
    // Add your logic here
  }
}
