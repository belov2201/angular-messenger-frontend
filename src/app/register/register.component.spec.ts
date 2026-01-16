import { RegisterComponent } from './register.component';
import { MessageService } from 'primeng/api';
import { UserService } from '@app/core/store/user/user.service';
import { of } from 'rxjs';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RegisterDto } from '@app/core/store/user';

let userServiceSpy: jasmine.SpyObj<UserService>;

describe('RegisterComponent', () => {
  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['register', 'getUserData']);
    userServiceSpy.register.and.returnValue(of(undefined));
    userServiceSpy.getUserData.and.returnValue(of());

    await render(RegisterComponent, {
      providers: [MessageService, { provide: UserService, useValue: userServiceSpy }],
    });
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
    expect(screen.getByText('Введенные пароли не совпадают')).toBeInTheDocument();
    expect(
      screen.getByText('Введенное значение содержит недопустимые символы'),
    ).toBeInTheDocument();
  });

  it('register success', async () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

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
