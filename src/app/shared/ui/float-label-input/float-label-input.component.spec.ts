import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatLabelInputComponent } from './float-label-input.component';

describe('FloatLabelInputComponent', () => {
  let component: FloatLabelInputComponent;
  let fixture: ComponentFixture<FloatLabelInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatLabelInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatLabelInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
