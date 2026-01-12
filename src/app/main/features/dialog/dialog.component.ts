import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageActionsComponent } from './components/message-actions/message-actions.component';
import { MessagesStore, MessagesStateStore } from './data-access/messages';
import { LoaderComponent } from '@app/shared/ui';
import { InputMessagesStateStore } from './data-access/input-messages';
import { ScrollStateStore } from './data-access/scroll';

@Component({
  selector: 'app-dialog',
  imports: [MessagesListComponent, MessageActionsComponent, LoaderComponent],
  template: `
    @if (currentMessagesState()?.isLoading) {
      <app-loader />
    }
    <app-messages-list />
    <app-message-actions />
  `,
  providers: [MessagesStateStore, MessagesStore, InputMessagesStateStore, ScrollStateStore],
  host: { class: 'h-full flex flex-col relative' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  protected readonly currentMessagesState = inject(MessagesStateStore).currentState;
}
