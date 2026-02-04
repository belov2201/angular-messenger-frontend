import { AvatarComponent } from './avatar.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { screen } from '@testing-library/angular';
import { userMock } from 'testing/mocks/user/user.mock';
import { participantsMock } from 'testing/mocks/participants/participants.mock';

describe('AvatarComponent', () => {
  it('should create', async () => {
    const { rerender } = await renderWithProviders(AvatarComponent, {
      inputs: { params: userMock },
    });

    expect(
      screen.getByText(
        [userMock.firstName[0], userMock.lastName[0]].reduce((r, e) => (r += e.toUpperCase()), ''),
      ),
    ).toBeInTheDocument();

    rerender({
      inputs: {
        component: AvatarComponent,
        componentInputs: { params: participantsMock[1] },
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
  });
});
