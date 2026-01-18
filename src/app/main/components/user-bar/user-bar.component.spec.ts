import { screen, waitFor } from '@testing-library/angular';
import { UserBarComponent } from './user-bar.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { userMock } from 'testing/mocks/user/user.mock';

describe('UserBarComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(UserBarComponent);
  });

  it('should create', () => {
    expect(screen.getByText(userMock.firstName + ' ' + userMock.lastName)).toBeInTheDocument();
  });

  it('open userbar menu', async () => {
    await screen.getByTestId('open-userbar-menu-button').click();
    await waitFor(() => expect(screen.getByText('Профиль')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Контакты')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Выйти')).toBeInTheDocument());
  });
});
