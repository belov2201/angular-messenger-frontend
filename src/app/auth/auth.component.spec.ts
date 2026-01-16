import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UserService } from '@app/core/store/user/user.service';
import { render, screen } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthComponent } from './auth.component';
import { AuthDto } from '@app/core/store/user/user.interface';
import userEvent from '@testing-library/user-event';

let userServiceSpy: jasmine.SpyObj<UserService>;

describe('AuthComponent', () => {
  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['auth', 'getUserData']);

    userServiceSpy.auth.and.returnValue(
      of({
        id: 1,
        username: 'username',
        firstName: 'Firstname',
        lastName: 'Lastname',
        avatar: null,
        inviteCode: 'fae3d417-82e7-4187-714c-f48912a0726e',
      }),
    );

    userServiceSpy.getUserData.and.returnValue(of());

    await render(AuthComponent, {
      providers: [MessageService, { provide: UserService, useValue: userServiceSpy }],
    });
  });

  it('should create', () => {
    expect(screen.getByText('Авторизация')).toBeInTheDocument();
    expect(screen.getByLabelText('Логин')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  it('with correct values', async () => {
    await userEvent.type(screen.getByLabelText('Логин'), 'Username');
    await userEvent.type(screen.getByLabelText('Пароль'), '12345678');
    expect(screen.getByRole('button', { name: 'Войти' })).not.toBeDisabled();
  });

  it('form with incorrect values', async () => {
    await userEvent.type(screen.getByLabelText('Логин'), 'someverylongvalue');
    await userEvent.type(screen.getByLabelText('Пароль'), '1234');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeDisabled();

    expect(
      screen.getByText('Введенное значение не может быть больше 16 символов'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Введенное значение не может быть меньше 8 символов'),
    ).toBeInTheDocument();
  });

  it('auth success', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const authDto: AuthDto = {
      username: 'username',
      password: '12345678',
    };

    await userEvent.type(screen.getByLabelText('Логин'), authDto.username);
    await userEvent.type(screen.getByLabelText('Пароль'), authDto.password);
    expect(screen.getByRole('button', { name: 'Войти' })).not.toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(userServiceSpy.auth).toHaveBeenCalledWith(authDto);
    expect(router.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });
});
