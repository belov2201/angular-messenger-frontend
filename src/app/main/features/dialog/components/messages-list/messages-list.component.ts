import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-messages-list',
  imports: [],
  templateUrl: './messages-list.component.html',
  host: { class: 'flex-auto' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent {}
