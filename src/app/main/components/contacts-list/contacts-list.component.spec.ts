import { screen } from '@testing-library/angular';
import { ContactsListComponent } from './contacts-list.component';
import { renderWithProviders } from 'testing/render-with-providers';

describe('ContactsListComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(ContactsListComponent);
  });

  it('should create', () => {
    expect(screen.getAllByTestId('contacts-list-item').length).toBe(3);
  });
});
