import { UserCardComponent } from './user-card.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { participantsMock } from 'testing/mocks/participants/participants.mock';
import { screen } from '@testing-library/angular';

describe('UserCardComponent', () => {
  it('should create', async () => {
    const { rerender } = await renderWithProviders(UserCardComponent, {
      inputs: {
        user: participantsMock[0],
        title: participantsMock[0].firstName,
        subtitle: participantsMock[0].lastName,
      },
    });

    expect(
      screen.getByText(
        [participantsMock[0].firstName[0], participantsMock[0].lastName[0]].reduce(
          (r, e) => (r += e.toUpperCase()),
          '',
        ),
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(participantsMock[0].firstName)).toBeInTheDocument();
    expect(screen.getByText(participantsMock[0].lastName)).toBeInTheDocument();

    rerender({
      inputs: {
        component: UserCardComponent,
        componentInputs: {
          user: participantsMock[1],
          title: participantsMock[1].firstName,
          subtitle: participantsMock[1].lastName,
        },
      },
    });

    expect(
      screen.getByText(
        [participantsMock[1].firstName[0], participantsMock[1].lastName[0]].reduce(
          (r, e) => (r += e.toUpperCase()),
          '',
        ),
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(participantsMock[1].firstName)).toBeInTheDocument();
    expect(screen.getByText(participantsMock[1].lastName)).toBeInTheDocument();
  });
});
