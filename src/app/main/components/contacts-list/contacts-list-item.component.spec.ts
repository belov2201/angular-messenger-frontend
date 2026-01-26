import { screen } from '@testing-library/angular';
import { ContactsListItemComponent } from './contacts-list-item.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { participantsMock } from 'testing/mocks/participants/participants.mock';

describe('ContactsListItemComponent', () => {
  it('should create', async () => {
    const { rerender } = await renderWithProviders(ContactsListItemComponent, {
      inputs: { contactEntity: contactsMock[0] },
    });

    expect(
      screen.getByText(participantsMock[1].firstName + ' ' + participantsMock[1].lastName),
    ).toBeInTheDocument();

    rerender({
      inputs: {
        component: ContactsListItemComponent,
        componentInputs: { contactEntity: contactsMock[1] },
      },
    });

    expect(
      screen.getByText(participantsMock[2].firstName + ' ' + participantsMock[2].lastName),
    ).toBeInTheDocument();

    rerender({
      inputs: {
        component: ContactsListItemComponent,
        componentInputs: { contactEntity: contactsMock[2] },
      },
    });

    expect(
      screen.getByText(participantsMock[3].firstName + ' ' + participantsMock[3].lastName),
    ).toBeInTheDocument();
  });
});
