import { AppComponent } from './app.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { RouterTestingHarness } from '@angular/router/testing';
import { screen } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { UserService } from './core/store/user/user.service';
import { throwError } from 'rxjs';

describe('AppComponent', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await renderWithProviders(AppComponent);
    harness = await RouterTestingHarness.create();
  });

  it('should create main component', async () => {
    await harness.navigateByUrl('');
    expect(screen.getByTestId('open-userbar-menu-button')).toBeInTheDocument();
  });

  it('should create main component from auth route', async () => {
    await harness.navigateByUrl('/auth');
    expect(screen.getByTestId('open-userbar-menu-button')).toBeInTheDocument();
  });

  it('should create auth component', async () => {
    const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userService.getUserData.and.returnValue(throwError(() => new Error('Unauthorized')));
    await harness.navigateByUrl('');
    expect(screen.getByText('Авторизация')).toBeInTheDocument();
  });

  it('should create register component', async () => {
    const userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    userService.getUserData.and.returnValue(throwError(() => new Error('Unauthorized')));
    await harness.navigateByUrl('/register');
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });
});
