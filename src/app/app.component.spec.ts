import { AppComponent } from './app.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { screen } from '@testing-library/angular';
import { UserService } from './core/store/user/user.service';
import { throwError } from 'rxjs';
import { createUserServiceMock } from 'testing/mocks/user/create-user-service.mock';
import { NavigateCb } from 'testing/types/navigate-cb';

describe('AppComponent', () => {
  let navigateByUrl: NavigateCb;

  describe('with user data response', () => {
    beforeEach(async () => {
      const { navigate } = await renderWithProviders(AppComponent);
      navigateByUrl = navigate;
    });

    it('should create main component', async () => {
      await navigateByUrl('');
      expect(screen.getByTestId('open-userbar-menu-button')).toBeInTheDocument();
    });

    it('should create main component from auth route', async () => {
      await navigateByUrl('/auth');
      expect(screen.getByTestId('open-userbar-menu-button')).toBeInTheDocument();
    });
  });

  describe('with error user data response', () => {
    beforeEach(async () => {
      const userServiceMock = createUserServiceMock();
      userServiceMock.getUserData.and.returnValue(throwError(() => new Error('Unauthorized')));

      const { navigate } = await renderWithProviders(AppComponent, {
        providers: [
          {
            provide: UserService,
            useValue: userServiceMock,
          },
        ],
      });

      navigateByUrl = navigate;
    });

    it('should create auth component', async () => {
      await navigateByUrl('');
      expect(screen.getByText('Авторизация')).toBeInTheDocument();
    });

    it('should create register component', async () => {
      await navigateByUrl('/register');
      expect(screen.getByText('Регистрация')).toBeInTheDocument();
    });
  });
});
