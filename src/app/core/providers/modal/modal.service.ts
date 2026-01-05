import { inject, Injectable, Type } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly dialogService = inject(DialogService);

  open<T>(component: Type<T>, config?: DynamicDialogConfig): DynamicDialogRef<T> | null {
    return this.dialogService.open(component, {
      modal: true,
      showHeader: false,
      dismissableMask: true,
      closeOnEscape: true,
      closable: true,
      style: {
        width: '50vw',
        'min-width': '300px',
        'max-width': '400px',
        'max-height': '70vh',
        'padding-top': '1.25rem',
      },
      ...config,
    });
  }
}
