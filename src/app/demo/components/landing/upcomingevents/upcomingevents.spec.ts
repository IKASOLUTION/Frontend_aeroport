import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Upcomingevents } from './upcomingevents';

describe('Upcomingevents', () => {
  let component: Upcomingevents;
  let fixture: ComponentFixture<Upcomingevents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upcomingevents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Upcomingevents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
