import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageActionsComponent } from './components/message-actions/message-actions.component';
import { LoaderComponent } from '@app/shared/ui';
import { MobileUserBarComponent } from './components/mobile-user-bar/mobile-user-bar.component';
import { DialogsStateStore } from '@app/main/data-access/dialogs-state';

@Component({
  selector: 'app-dialog',
  imports: [
    MessagesListComponent,
    MessageActionsComponent,
    LoaderComponent,
    MobileUserBarComponent,
  ],
  template: `
    @if (currentDialogState()?.isLoading) {
      <app-loader [zIndex]="100" />
    }

    <app-mobile-user-bar />
    <app-messages-list />
    <app-message-actions />
  `,
  providers: [],
  host: { class: 'h-full flex flex-col relative' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  protected readonly currentDialogState = inject(DialogsStateStore).currentState;
}
