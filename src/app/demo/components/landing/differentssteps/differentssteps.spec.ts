import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Differentssteps } from './differentssteps';

describe('Differentssteps', () => {
  let component: Differentssteps;
  let fixture: ComponentFixture<Differentssteps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Differentssteps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Differentssteps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
