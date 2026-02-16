import { renderWithProviders } from 'testing/render-with-providers';
import { DialogComponent } from './dialog.component';
import { screen } from '@testing-library/angular';
import { messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { signal } from '@angular/core';

describe('DialogComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(DialogComponent, {
      providers: [{ provide: CurrentDialogIdService, useValue: { value: signal(0) } }],
    });
  });

  it('should create', async () => {
    expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk);
    expect(screen.getByTestId('send-message-btn')).toBeInTheDocument();
  });
});
