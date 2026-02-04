import { RegisterComponent } from './register.component';
import { fireEvent, screen } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RegisterDto } from '@app/core/store/user';
import { renderWithProviders } from 'testing/render-with-providers';
import { UserService } from '@app/core/store/user/user.service';
import userEvent from '@testing-library/user-event';

describe('RegisterComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(RegisterComponent);
  });

  it('should create', () => {
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
    expect(screen.getByLabelText('Логин')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('Повторите пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('Имя')).toBeInTheDocument();
    expect(screen.getByLabelText('Фамилия')).toBeInTheDocument();
  });

  it('with correct values', async () => {
    await userEvent.type(screen.getByLabelText('Логин'), 'Username');
    await userEvent.type(screen.getByLabelText('Пароль'), '12345678');
    await userEvent.type(screen.getByLabelText('Повторите пароль'), '12345678');
    await userEvent.type(screen.getByLabelText('Имя'), 'Firstname');
    await userEvent.type(screen.getByLabelText('Фамилия'), 'Lastname');
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).not.toBeDisabled();
  });

  it('form with incorrect values', async () => {
    await userEvent.type(screen.getByLabelText('Логин'), 'username');
    await userEvent.type(screen.getByLabelText('Пароль'), '123456789');
    await userEvent.type(screen.getByLabelText('Повторите пароль'), '12345678');
    await userEvent.type(screen.getByLabelText('Имя'), 'firstName123');
    await userEvent.type(screen.getByLabelText('Фамилия'), 'lastName');

    fireEvent.blur(screen.getByLabelText('Повторите пароль'));
    fireEvent.blur(screen.getByLabelText('Имя'));

    expect(screen.getByText('Введенные пароли не совпадают')).toBeInTheDocument();

    expect(
      screen.getByText('Введенное значение содержит недопустимые символы'),
    ).toBeInTheDocument();
  });

  it('register success', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const userServiceSpy = TestBed.inject(UserService);

    const registerDto: RegisterDto = {
      username: 'username',
      password: '12345678',
      repeatPassword: '12345678',
      firstName: 'Firstname',
      lastName: 'Lastname',
    };

    await userEvent.type(screen.getByLabelText('Логин'), registerDto.username);
    await userEvent.type(screen.getByLabelText('Пароль'), registerDto.password);
    await userEvent.type(screen.getByLabelText('Повторите пароль'), registerDto.repeatPassword);
    await userEvent.type(screen.getByLabelText('Имя'), registerDto.firstName);
    await userEvent.type(screen.getByLabelText('Фамилия'), registerDto.lastName);
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).not.toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    expect(userServiceSpy.register).toHaveBeenCalledWith(registerDto);
    expect(router.navigate).toHaveBeenCalledWith(['auth'], { replaceUrl: true });
  });
});
