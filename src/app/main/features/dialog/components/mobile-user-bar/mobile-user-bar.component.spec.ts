import { renderWithProviders } from 'testing/render-with-providers';
import { MobileUserBarComponent } from './mobile-user-bar.component';
import { screen, within } from '@testing-library/angular';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { userMock } from 'testing/mocks/user/user.mock';
import { TestBed } from '@angular/core/testing';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { signal } from '@angular/core';

describe('MobileUserBarComponent', () => {
  const testDialogId = 0;

  beforeEach(async () => {
    await renderWithProviders(MobileUserBarComponent, {
      providers: [{ provide: CurrentDialogIdService, useValue: { value: signal(testDialogId) } }],
    });

    TestBed.tick();
  });

  it('should create', async () => {
    const participant = contactsMock[testDialogId].participants.find((e) => e.id !== userMock.id);
    const userBar = screen.getByTestId('mobile-user-bar');

    expect(
      within(userBar).getByText(participant?.firstName + ' ' + participant?.lastName),
    ).toBeInTheDocument();
  });
});
