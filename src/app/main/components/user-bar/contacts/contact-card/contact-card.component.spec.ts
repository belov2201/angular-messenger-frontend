import { renderWithProviders } from 'testing/render-with-providers';
import { ContactCardComponent } from './contact-card.component';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { screen } from '@testing-library/angular';
import { participantsMock } from 'testing/mocks/participants/participants.mock';

describe('ContactCardComponent', () => {
  it('should create', async () => {
    const { rerender } = await renderWithProviders(ContactCardComponent, {
      inputs: { contactEntity: contactsMock[0] },
    });

    expect(
      screen.getByText(participantsMock[1].firstName + ' ' + participantsMock[1].lastName),
    ).toBeInTheDocument();

    rerender({
      inputs: {
        component: ContactCardComponent,
        componentInputs: { contactEntity: contactsMock[1] },
      },
    });

    screen.getByText(participantsMock[2].firstName + ' ' + participantsMock[2].lastName);

    rerender({
      inputs: {
        component: ContactCardComponent,
        componentInputs: { contactEntity: contactsMock[2] },
      },
    });

    screen.getByText(participantsMock[3].firstName + ' ' + participantsMock[3].lastName);
  });
});
