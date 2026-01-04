import { inject, Injectable } from '@angular/core';
import { Confirmation, ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService {
  private readonly confirmationService = inject(ConfirmationService);

  open(confirmation: Confirmation) {
    this.confirmationService.confirm({
      closeOnEscape: true,
      closable: true,
      acceptLabel: 'Подтвердить',
      rejectLabel: 'Отменить',
      dismissableMask: true,
      ...confirmation,
    });
  }
}
