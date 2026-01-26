import { screen } from '@testing-library/angular';
import { ContactsListComponent } from './contacts-list.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';

describe('ContactsListComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(ContactsListComponent);
  });

  it('should create', () => {
    expect(screen.getAllByTestId('contacts-list-item').length).toBe(contactsMock.length);
  });
});
