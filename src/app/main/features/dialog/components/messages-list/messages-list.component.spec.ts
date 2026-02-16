import { render, screen } from '@testing-library/angular';
import { MessagesListComponent } from './messages-list.component';
import { messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from '@app/main/data-access/messages/messages.service';
import userEvent from '@testing-library/user-event';
import { getSharedProviders } from 'testing/get-shared-providers';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { mainRoutes } from '@app/main/main.routes';

describe('MessagesListComponent', () => {
  const testDialogId = 0;

  beforeEach(async () => {
    const { navigate } = await render(
      `<div class="h-230 overflow-hidden flex">
        <app-messages-list />
      </div>`,
      {
        providers: [
          ...getSharedProviders(),
          provideRouter(mainRoutes),
          { provide: CurrentDialogIdService, useValue: { value: signal(0) } },
        ],
        imports: [MessagesListComponent],
      },
    );

    navigate(`/dialog/${testDialogId}`);
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
