import { RouterTestingHarness } from '@angular/router/testing';
import { renderWithProviders } from 'testing/render-with-providers';
import { screen } from '@testing-library/angular';
import { MessagesListComponent } from './messages-list.component';
import { messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from '@app/main/data-access/messages/messages.service';
import userEvent from '@testing-library/user-event';

describe('MessagesListComponent', () => {
  const testDialogId = 0;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await renderWithProviders(MessagesListComponent);
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/dialog/${testDialogId}`);
  });

  it('should create', async () => {
    const messagesService = TestBed.inject(MessagesService);

    const messageCards = screen.getAllByTestId('message-card');
    expect(messageCards.length).toBe(messagesMockChunk);
    expect(messagesService.getAll).toHaveBeenCalledOnceWith(0);

    await userEvent.click(messageCards[messageCards.length - 2]);
    expect(screen.getByText('Редактировать')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });
});
