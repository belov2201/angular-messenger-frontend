import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { AvatarComponent } from '@app/shared/ui';
import { Message, MessagesStateStore } from '../../data-access/messages';
import { ScrollBottomDirective } from './directives/scroll-bottom.directive';
import { MessageCardComponent } from './message-card/message-card.component';
import { IntersectionService } from './providers/intersection.service';
import { VisibilityDirective } from './directives/visibility.directive';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ConfirmModalService } from '@app/core/providers';
import { InputMessagesStateStore } from '../../data-access/input-messages';
import { ScrollStateStore } from '../../data-access/scroll';

@Component({
  selector: 'app-messages-list',
  imports: [NgClass, AvatarComponent, MessageCardComponent, VisibilityDirective, Menu],
  templateUrl: './messages-list.component.html',
  providers: [IntersectionService],
  host: { class: 'flex-auto p-4 overflow-auto' },
  hostDirectives: [{ directive: ScrollBottomDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent {
  private readonly messagesStateStore = inject(MessagesStateStore);
  private readonly inputMessagesStateStore = inject(InputMessagesStateStore);
  private readonly scrollStateStore = inject(ScrollStateStore);
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly confirmModalService = inject(ConfirmModalService);

  protected readonly messages = this.messagesStateStore.currentMessages;

  protected activeMessage: Message | null = null;

  protected readonly menuItems: MenuItem[] = [
    {
      label: 'Редактировать',
      command: () => {
        if (!this.activeMessage) return;
        this.inputMessagesStateStore.setEditState(this.activeMessage);
      },
    },
    {
      label: 'Удалить',
      command: () => {
        this.openDeleteMessageDialog();
      },
    },
  ];

  private openDeleteMessageDialog() {
    this.confirmModalService.open({
      message: 'Вы уверены, что хотите удалить это сообщение?',
      accept: () => {
        if (!this.activeMessage) return;
        this.messagesStateStore.deleteMessage(this.activeMessage);
      },
    });
  }

  protected changeCurrentViewLast(value: boolean) {
    this.messagesStateStore.setIsViewLast(value);
  }

  protected firstVisibleHandler(isVisible: boolean) {
    if (!isVisible) return;
    this.scrollStateStore.setPrevScrollHeight(this.elementRef.nativeElement.scrollHeight);
    this.messagesStateStore.getAdditionalMessagesData();
  }

  protected handleUnreadMessage(message: Message) {
    return (isVisible: boolean) => {
      if (!isVisible) return;
      this.messagesStateStore.addToUpdateReadStatusMessages(message);
    };
  }
}
