import { RouterTestingHarness } from '@angular/router/testing';
import { renderWithProviders } from 'testing/render-with-providers';
import { MobileUserBarComponent } from './mobile-user-bar.component';
import { screen, within } from '@testing-library/angular';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { userMock } from 'testing/mocks/user/user.mock';

describe('MobileUserBarComponent', () => {
  const testDialogId = 0;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await renderWithProviders(MobileUserBarComponent);
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/dialog/${testDialogId}`);
  });

  it('should create', async () => {
    const participant = contactsMock[testDialogId].participants.find((e) => e.id !== userMock.id);
    const userBar = screen.getByTestId('mobile-user-bar');

    expect(
      within(userBar).getByText(participant?.firstName + ' ' + participant?.lastName),
    ).toBeInTheDocument();
  });
});
