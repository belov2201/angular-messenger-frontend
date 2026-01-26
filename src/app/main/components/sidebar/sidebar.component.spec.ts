import { screen } from '@testing-library/angular';
import { SidebarComponent } from './sidebar.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { userMock } from 'testing/mocks/user/user.mock';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(SidebarComponent);
  });

  it('should create', () => {
    expect(screen.getByText(userMock.firstName + ' ' + userMock.lastName)).toBeInTheDocument();
    expect(screen.getAllByTestId('contacts-list-item').length).toBe(contactsMock.length);
  });
});
