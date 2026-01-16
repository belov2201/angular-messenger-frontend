import { screen } from '@testing-library/angular';
import { SidebarComponent } from './sidebar.component';
import { ContactsStore } from '@app/main/data-access/contacts';
import { WsService } from '@app/main/providers/ws/ws.service';
import { renderWithProviders } from 'testing/render-with-providers';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(SidebarComponent, {
      providers: [ContactsStore, WsService],
    });
  });

  it('should create', () => {
    expect(screen.getByText('Авторизация')).toBeInTheDocument();
    expect(screen.getByLabelText('Логин')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  // it('with correct values', async () => {
  //   await userEvent.type(screen.getByLabelText('Логин'), 'Username');
  //   await userEvent.type(screen.getByLabelText('Пароль'), '12345678');
  //   expect(screen.getByRole('button', { name: 'Войти' })).not.toBeDisabled();
  // });

  // it('form with incorrect values', async () => {
  //   await userEvent.type(screen.getByLabelText('Логин'), 'someverylongvalue');
  //   await userEvent.type(screen.getByLabelText('Пароль'), '1234');
  //   await userEvent.tab();
  //   expect(screen.getByRole('button', { name: 'Войти' })).toBeDisabled();

  //   expect(
  //     screen.getByText('Введенное значение не может быть больше 16 символов'),
  //   ).toBeInTheDocument();

  //   expect(
  //     screen.getByText('Введенное значение не может быть меньше 8 символов'),
  //   ).toBeInTheDocument();
  // });

  // it('auth success', async () => {
  //   const router = TestBed.inject(Router);
  //   spyOn(router, 'navigate');

  //   const authDto: AuthDto = {
  //     username: 'username',
  //     password: '12345678',
  //   };

  //   await userEvent.type(screen.getByLabelText('Логин'), authDto.username);
  //   await userEvent.type(screen.getByLabelText('Пароль'), authDto.password);
  //   expect(screen.getByRole('button', { name: 'Войти' })).not.toBeDisabled();

  //   await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

  //   expect(userServiceSpy.auth).toHaveBeenCalledWith(authDto);
  //   expect(router.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  // });
});
