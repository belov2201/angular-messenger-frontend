import { MessageActionsComponent } from './message-actions.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { Socket } from 'ngx-socket-io';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { signal } from '@angular/core';

describe('MessageActionsComponent', () => {
  const testDialogId = 1;

  beforeEach(async () => {
    await renderWithProviders(MessageActionsComponent, {
      providers: [{ provide: CurrentDialogIdService, useValue: { value: signal(testDialogId) } }],
    });
  });

  it('should create', async () => {
    expect(screen.getByTestId('send-message-btn').querySelector('button')).toHaveAttribute(
      'disabled',
    );
  });

  it('input message', async () => {
    const socket = TestBed.inject(Socket);
    const testMessage = 'some message';

    await userEvent.type(screen.getByPlaceholderText('Введите сообщение'), testMessage);

    expect(screen.getByTestId('send-message-btn').querySelector('button')).not.toHaveAttribute(
      'disabled',
    );

    expect(socket.emit).toHaveBeenCalledTimes(testMessage.length);
    expect(socket.emit).toHaveBeenCalledWith(WsEvents.typing, { contactId: testDialogId });
  });
});
