import { MessageCardComponent } from './message-card.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { screen } from '@testing-library/angular';
import { messagesMock } from 'testing/mocks/messages/messages.mock';
import { mapToMessageView } from '@app/main/data-access/messages/messages.mapper';
import { userMock } from 'testing/mocks/user/user.mock';

describe('MessageCardComponent', () => {
  it('should create', async () => {
    const { rerender } = await renderWithProviders(MessageCardComponent, {
      inputs: { message: mapToMessageView(messagesMock[0], userMock)! },
    });

    expect(screen.getByText(messagesMock[0].text)).toBeInTheDocument();

    rerender({
      inputs: {
        component: MessageCardComponent,
        componentInputs: { message: mapToMessageView(messagesMock[1], userMock)! },
      },
    });

    expect(screen.getByText(messagesMock[1].text)).toBeInTheDocument();
  });
});
