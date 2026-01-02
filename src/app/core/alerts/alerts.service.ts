import { inject, Injectable } from '@angular/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private readonly messages = inject(MessageService);

  private baseToastOptions: ToastMessageOptions = {
    closable: false,
    life: 3000,
  };

  showSuccessAlert(message: string) {
    this.messages.add({
      ...this.baseToastOptions,
      severity: 'success',
      detail: message,
    });
  }

  showErrorAlert(message: string) {
    this.messages.add({
      ...this.baseToastOptions,
      severity: 'error',
      detail: message,
    });
  }
}
