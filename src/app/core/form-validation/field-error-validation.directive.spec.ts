import { fireEvent, screen } from '@testing-library/angular';
import { renderWithProviders } from 'testing/render-with-providers';
import { AuthComponent } from '@app/auth/auth.component';
import userEvent from '@testing-library/user-event';

describe('FieldErrorValidationDirective', () => {
  it('show error message', async () => {
    await renderWithProviders(AuthComponent);
    await userEvent.type(screen.getByLabelText('Логин'), 'lo gin');
    await userEvent.type(screen.getByLabelText('Пароль'), '123');

    fireEvent.blur(screen.getByLabelText('Логин'));

    expect(
      screen.getByText('Введенное значение содержит недопустимые символы'),
    ).toBeInTheDocument();
  });
});
