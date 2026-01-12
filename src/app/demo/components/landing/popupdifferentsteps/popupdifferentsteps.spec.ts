import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Popupdifferentsteps } from './popupdifferentsteps';

describe('Popupdifferentsteps', () => {
  let component: Popupdifferentsteps;
  let fixture: ComponentFixture<Popupdifferentsteps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Popupdifferentsteps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Popupdifferentsteps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
