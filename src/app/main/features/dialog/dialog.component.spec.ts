import { renderWithProviders } from 'testing/render-with-providers';
import { DialogComponent } from './dialog.component';
import { screen } from '@testing-library/angular';
import { RouterTestingHarness } from '@angular/router/testing';
import { messagesMockChunk } from 'testing/mocks/messages/messages.mock';

describe('DialogComponent', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await renderWithProviders(DialogComponent);
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dialog/0');
  });

  it('should create', async () => {
    expect(screen.getAllByTestId('message-card').length).toBe(messagesMockChunk);
    expect(screen.getByTestId('send-message-btn')).toBeInTheDocument();
  });
});
