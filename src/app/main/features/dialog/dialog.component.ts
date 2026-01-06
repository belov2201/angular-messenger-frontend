import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessagesListComponent } from './components/messages-list/messages-list.component';
import { MessageActionsComponent } from './components/message-actions/message-actions.component';

@Component({
  selector: 'app-dialog',
  imports: [MessagesListComponent, MessageActionsComponent],
  template: `
    <app-messages-list />
    <app-message-actions />
  `,
  host: { class: 'h-full flex flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {}
