import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileUserBarComponent } from './mobile-user-bar.component';

describe('MobileUserBarComponent', () => {
  let component: MobileUserBarComponent;
  let fixture: ComponentFixture<MobileUserBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileUserBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileUserBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
