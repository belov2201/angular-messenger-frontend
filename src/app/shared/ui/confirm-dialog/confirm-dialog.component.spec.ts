import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { render, screen, waitFor } from '@testing-library/angular';
import { ConfirmModalService } from '@app/core/providers';
import { ConfirmationService } from 'primeng/api';

describe('ConfirmDialogComponent', () => {
  it('should create', async () => {
    await render(ConfirmDialogComponent, {
      providers: [ConfirmModalService, ConfirmationService],
    });

    const confirmModalService = TestBed.inject(ConfirmModalService);
    const confirmModalMessage = 'Confirm modal message';
    confirmModalService.open({ message: confirmModalMessage });
    await waitFor(() => expect(screen.getByText(confirmModalMessage)).toBeInTheDocument());
  });
});
