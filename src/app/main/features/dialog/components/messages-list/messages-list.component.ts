import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { AvatarComponent } from '@app/shared/ui';
import { MessagesStateStore } from '../../data-access/messages';
import { ScrollBottomDirective } from './directives/scroll-bottom.directive';
import { MessageCardComponent } from './message-card/message-card.component';
import { IntersectionService } from './providers/intersection.service';
import { VisibilityDirective } from './directives/visibility.directive';

@Component({
  selector: 'app-messages-list',
  imports: [NgClass, AvatarComponent, MessageCardComponent, VisibilityDirective],
  templateUrl: './messages-list.component.html',
  providers: [IntersectionService],
  host: { class: 'flex-auto p-4 overflow-auto' },
  hostDirectives: [{ directive: ScrollBottomDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent {
  protected readonly messages = inject(MessagesStateStore).currentMessages;
  private readonly messagesStateStore = inject(MessagesStateStore);
  private readonly currentMessagesState = this.messagesStateStore.currentState;

  changeCurrentViewLast(value: boolean) {
    const currentMessageState = this.currentMessagesState();
    if (!currentMessageState) return;
    this.messagesStateStore.setIsViewLast(currentMessageState.id, value);
  }
}
