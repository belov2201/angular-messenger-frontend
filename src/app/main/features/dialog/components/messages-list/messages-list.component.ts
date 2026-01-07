import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessagesStore } from '../../data-access/messages';
import { DatePipe, NgClass } from '@angular/common';
import { IconComponent, AvatarComponent } from '@app/shared/ui';

@Component({
  selector: 'app-messages-list',
  imports: [NgClass, IconComponent, DatePipe, AvatarComponent],
  templateUrl: './messages-list.component.html',
  host: { class: 'flex-auto p-4 overflow-auto' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent {
  protected readonly messagesStore = inject(MessagesStore);
}
