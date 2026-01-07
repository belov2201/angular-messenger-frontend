import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageActionsComponent } from './components/message-actions/message-actions.component';
import { MessagesStore } from './data-access/messages';

@Component({
  selector: 'app-dialog',
  imports: [MessagesListComponent, MessageActionsComponent],
  template: `
    <app-messages-list />
    <app-message-actions />
  `,
  providers: [MessagesStore],
  host: { class: 'h-full flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {}
