import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popupdifferentsteps',
  standalone:true,
  templateUrl: './popupdifferentsteps.html',
  imports: [CommonModule],
  styleUrls: ['./popupdifferentsteps.css'],
})
export class Popupdifferentsteps implements OnInit {
  showPopup: boolean = true; // Controls visibility

  @ViewChild('popupContainer') popupContainer!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.showPopup = true; // Show on page load
  }

  closePopup() {
    this.showPopup = false;
  }

  onBackdropClick(event: MouseEvent) {
    // Close only if clicked outside popup content
    if (this.popupContainer && !this.popupContainer.nativeElement.contains(event.target)) {
      this.closePopup();
    }
  }
}
