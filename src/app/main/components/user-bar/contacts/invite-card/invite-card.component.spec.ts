import { screen } from '@testing-library/angular';
import { renderWithProviders } from 'testing/render-with-providers';
import { invitesMock } from 'testing/mocks/invites/invites.mock';
import { InviteCardComponent } from './invite-card.component';
import { participantsMock } from 'testing/mocks/participants/participants.mock';

describe('InviteCardComponent', () => {
  it('should create', async () => {
    const { rerender } = await renderWithProviders(InviteCardComponent, {
      inputs: { inviteEntity: invitesMock[0] },
    });

    expect(
      screen.getByText(participantsMock[1].firstName + ' ' + participantsMock[1].lastName),
    ).toBeInTheDocument();

    rerender({
      inputs: {
        component: InviteCardComponent,
        componentInputs: { inviteEntity: invitesMock[1] },
      },
    });

    screen.getByText(participantsMock[2].firstName + ' ' + participantsMock[2].lastName);

    rerender({
      inputs: {
        component: InviteCardComponent,
        componentInputs: { inviteEntity: invitesMock[2] },
      },
    });

    screen.getByText(participantsMock[3].firstName + ' ' + participantsMock[3].lastName);
  });
});
