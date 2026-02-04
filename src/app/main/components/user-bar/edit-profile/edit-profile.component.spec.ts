import { renderWithProviders } from 'testing/render-with-providers';
import { EditProfileComponent } from './edit-profile.component';
import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/angular';
import { userMock } from 'testing/mocks/user/user.mock';
import userEvent from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { UserStore } from '@app/core/store/user';
import { UserService } from '@app/core/store/user/user.service';

describe('EditProfileComponent', () => {
  const testUserMockStringAvatar = [userMock.firstName[0], userMock.lastName[0]]
    .join('')
    .toUpperCase();

  beforeEach(async () => {
    await renderWithProviders(EditProfileComponent);
  });

  it('should create', () => {
    expect(screen.getByText(testUserMockStringAvatar)).toBeInTheDocument();

    expect(screen.getByLabelText<HTMLInputElement>('Имя').value).toBe(userMock.firstName);
    expect(screen.getByLabelText<HTMLInputElement>('Фамилия').value).toBe(userMock.lastName);
    expect(screen.getByText('Код приглашения')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeDisabled();
  });

  it('disable form button with no change values', async () => {
    await userEvent.type(screen.getByLabelText('Имя'), 'Edit');
    await userEvent.type(screen.getByLabelText('Фамилия'), 'Edit');
    expect(screen.getByRole('button', { name: 'Редактировать' })).not.toBeDisabled();

    await userEvent.clear(screen.getByLabelText('Имя'));
    await userEvent.clear(screen.getByLabelText('Фамилия'));

    await userEvent.type(screen.getByLabelText('Имя'), userMock.firstName);
    await userEvent.type(screen.getByLabelText('Фамилия'), userMock.lastName);
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeDisabled();
  });

  it('show error form', async () => {
    await userEvent.type(screen.getByLabelText('Имя'), '123');
    fireEvent.blur(screen.getByLabelText('Имя'));
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeDisabled();

    expect(
      screen.getByText('Введенное значение содержит недопустимые символы'),
    ).toBeInTheDocument();
  });

  it('edit avatar', async () => {
    const userStore = TestBed.inject(UserStore);
    const userService = TestBed.inject(UserService);

    expect(userStore.user()?.avatar).toBeNull();

    const loadFileName = 'some-test-file.jpg';

    await userEvent.click(screen.getByTestId('edit-avatar'));

    expect(screen.getByRole('menuitem', { name: 'Редактировать' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Удалить' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await userEvent.upload(
      screen.getByRole('file-input', { hidden: true }),
      new File([], loadFileName),
    );

    expect(userService.editUserAvatar).toHaveBeenCalledTimes(1);

    expect(userStore.user()?.avatar).toBe(loadFileName);

    await userEvent.click(screen.getByTestId('edit-avatar'));
    expect(screen.getByRole('menuitem', { name: 'Удалить' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );

    await userEvent.click(screen.getByText('Удалить'));

    expect(screen.getByText('Вы уверены, что хотите удалить аватар?'));
    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    await waitForElementToBeRemoved(() =>
      screen.queryByText('Вы уверены, что хотите удалить аватар?'),
    );

    await userEvent.click(screen.getByTestId('edit-avatar'));
    expect(screen.getByRole('menuitem', { name: 'Удалить' })).toHaveAttribute(
      'aria-disabled',
      'false',
    );

    await userEvent.click(screen.getByText('Удалить'));
    expect(screen.getByText('Вы уверены, что хотите удалить аватар?'));
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    await waitFor(() => expect(screen.getByText('Аватар удален')).toBeInTheDocument());
    expect(userService.deleteUserAvatar).toHaveBeenCalledTimes(1);
    expect(screen.getByText(testUserMockStringAvatar)).toBeInTheDocument();
  });

  it('edit user', async () => {
    const userService = TestBed.inject(UserService);

    await userEvent.type(screen.getByLabelText('Имя'), 'Edit');
    await userEvent.type(screen.getByLabelText('Фамилия'), 'Edit');

    expect(screen.getByRole('button', { name: 'Редактировать' })).not.toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Редактировать' }));

    expect(userService.editUserData).toHaveBeenCalledTimes(1);

    expect(screen.getByLabelText<HTMLInputElement>('Имя').value).toBe(userMock.firstName + 'Edit');

    expect(screen.getByLabelText<HTMLInputElement>('Фамилия').value).toBe(
      userMock.lastName + 'Edit',
    );
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeDisabled();
  });
});
