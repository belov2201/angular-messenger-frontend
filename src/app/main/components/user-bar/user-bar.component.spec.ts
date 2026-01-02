import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBarComponent } from './user-bar.component';

describe('UserBarComponent', () => {
  let component: UserBarComponent;
  let fixture: ComponentFixture<UserBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
