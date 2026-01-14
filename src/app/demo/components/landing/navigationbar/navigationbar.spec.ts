import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navigationbar } from './navigationbar';

describe('Navigationbar', () => {
  let component: Navigationbar;
  let fixture: ComponentFixture<Navigationbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navigationbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navigationbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
