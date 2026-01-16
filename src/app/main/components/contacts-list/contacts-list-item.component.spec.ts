import { screen } from '@testing-library/angular';
import { ContactsListItemComponent } from './contacts-list-item.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { contactParticipants, contactsMock } from 'testing/mocks/contacts/contacts.mock';

describe('ContactsListItemComponent', () => {
  it('should create', async () => {
    const { rerender } = await renderWithProviders(ContactsListItemComponent, {
      inputs: { contactEntity: contactsMock[0] },
    });

    screen.getByText(contactParticipants[1].firstName + ' ' + contactParticipants[1].lastName);
    rerender({ inputs: { contactEntity: contactsMock[1] } });
    screen.getByText(contactParticipants[2].firstName + ' ' + contactParticipants[2].lastName);
    rerender({ inputs: { contactEntity: contactsMock[2] } });
    screen.getByText(contactParticipants[3].firstName + ' ' + contactParticipants[3].lastName);
  });
});
