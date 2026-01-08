import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { IconComponent, AvatarComponent } from '@app/shared/ui';
import { MessagesStateStore } from '../../data-access/messages';

@Component({
  selector: 'app-messages-list',
  imports: [NgClass, IconComponent, DatePipe, AvatarComponent],
  templateUrl: './messages-list.component.html',
  host: { class: 'flex-auto p-4 overflow-auto' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent {
  protected readonly messages = inject(MessagesStateStore).currentMessages;
}
