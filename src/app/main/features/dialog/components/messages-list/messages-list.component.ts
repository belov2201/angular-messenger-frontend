import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
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
  private readonly messagesStateStore = inject(MessagesStateStore);
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  protected readonly messages = this.messagesStateStore.currentMessages;

  protected changeCurrentViewLast(value: boolean) {
    this.messagesStateStore.setIsViewLast(value);
  }

  protected firstVisibleHandler(isVisible: boolean) {
    if (!isVisible) return;
    this.messagesStateStore.setPrevScrollHeight(this.elementRef.nativeElement.scrollHeight);
    this.messagesStateStore.getAdditionalMessagesData();
  }
}
