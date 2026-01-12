import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css',
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  autoplay = true;
  interval: any;

  slides = [
    {
      image: 'assets/assets/sliderImages/1.jpg',
    },
    {
      image: 'assets/assets/sliderImages/2.jpg',
    },
    {
      image: 'assets/assets/sliderImages/3.jpg',
    },
    {
      image: 'assets/assets/sliderImages/4.jpg',
    },
    {
      image: 'assets/assets/sliderImages/5.jpg',
    },
    {
      image: 'assets/assets/sliderImages/6.jpg',
    },
    {
      image: 'assets/assets/sliderImages/7.jpg',
    },
    {
      image: 'assets/assets/sliderImages/8.jpg',
    },
    {
      image: 'assets/assets/sliderImages/9.jpg',
    },
    {
      image: 'assets/assets/sliderImages/10.jpg',
    },
    {
      image: 'assets/assets/sliderImages/11.jpg',
    },
    {
      image: 'assets/assets/sliderImages/12.jpg',
    },
    {
      image: 'assets/assets/sliderImages/13.jpg',
    },
    {
      image: 'assets/assets/sliderImages/14.jpg',
    },
  ];

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  next() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    // Manually trigger change detection
    this.cdr.detectChanges();
    console.log('Next slide:', this.currentSlide);
  }

  startAutoplay() {
    this.interval = setInterval(() => {
      if (this.autoplay) {
        this.next();
      }
      console.log('Autoplay i am the one you made today!');
    }, 5000);
  }
}
