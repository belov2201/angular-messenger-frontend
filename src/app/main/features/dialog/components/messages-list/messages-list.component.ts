import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { AvatarComponent } from '@app/shared/ui';
import { MessagesStateStore } from '../../data-access/messages';
import { ScrollBottomDirective } from './directives/scroll-bottom.directive';
import { MessageCardComponent } from './message-card/message-card.component';

@Component({
  selector: 'app-messages-list',
  imports: [NgClass, AvatarComponent, MessageCardComponent],
  templateUrl: './messages-list.component.html',
  host: { class: 'flex-auto p-4 overflow-auto' },
  hostDirectives: [{ directive: ScrollBottomDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent {
  protected readonly messages = inject(MessagesStateStore).currentMessages;
}
