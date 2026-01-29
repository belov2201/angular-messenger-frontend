import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageActionsComponent } from './components/message-actions/message-actions.component';
import { MessagesStore } from './data-access/messages';
import { LoaderComponent } from '@app/shared/ui';
import { InputMessagesStateStore } from './data-access/input-messages';
import { ScrollStateStore } from './data-access/scroll';
import { DialogsStateStore } from './data-access/dialogs-state/dialogs-state.store';

@Component({
  selector: 'app-dialog',
  imports: [MessagesListComponent, MessageActionsComponent, LoaderComponent],
  template: `
    @if (currentMessagesState()?.isLoading) {
      <app-loader [zIndex]="100" />
    }
    <app-messages-list />
    <app-message-actions />
  `,
  providers: [DialogsStateStore, MessagesStore, InputMessagesStateStore, ScrollStateStore],
  host: { class: 'h-full flex flex-col relative' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  protected readonly currentMessagesState = inject(DialogsStateStore).currentState;
}
