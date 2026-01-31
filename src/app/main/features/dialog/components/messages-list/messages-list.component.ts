import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { AvatarComponent } from '@app/shared/ui';
import { ScrollBottomDirective } from './directives/scroll-bottom.directive';
import { MessageCardComponent } from './message-card/message-card.component';
import { IntersectionService } from './providers/intersection.service';
import { VisibilityDirective } from './directives/visibility.directive';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ConfirmModalService } from '@app/core/providers';
import { DialogsStateStore } from '@app/main/data-access/dialogs-state';
import { InputMessagesStateStore } from '@app/main/data-access/input-messages';
import { ScrollStateStore } from '@app/main/data-access/scroll';
import { Message, MessagesStore } from '@app/main/data-access/messages';
import { filter, fromEvent } from 'rxjs';

@Component({
  selector: 'app-messages-list',
  imports: [NgClass, AvatarComponent, MessageCardComponent, VisibilityDirective, Menu],
  templateUrl: './messages-list.component.html',
  providers: [IntersectionService],
  host: { class: 'flex-auto p-4 overflow-auto' },
  hostDirectives: [{ directive: ScrollBottomDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent implements OnInit, OnDestroy {
  private readonly dialogsStateStore = inject(DialogsStateStore);
  private readonly messagesStore = inject(MessagesStore);
  private readonly inputMessagesStateStore = inject(InputMessagesStateStore);
  private readonly scrollStateStore = inject(ScrollStateStore);
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly confirmModalService = inject(ConfirmModalService);

  private readonly menu = viewChild<Menu>('menu');
  protected readonly messages = this.dialogsStateStore.currentMessages;
  protected activeMessage: Message | null = null;

  private readonly scrollEvent = fromEvent(this.elementRef.nativeElement, 'scroll').pipe(
    filter(() => {
      const el = this.elementRef.nativeElement;
      return el.scrollHeight - el.scrollTop - el.clientHeight > 1;
    }),
  );

  ngOnInit(): void {
    this.dialogsStateStore.addToUpdateMessageStatusObservables(this.scrollEvent);
  }

  ngOnDestroy(): void {
    this.dialogsStateStore.deleteFromUpdateMessageStatusObservables(this.scrollEvent);
  }

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

  protected onMessageClick(event: Event, message: Message) {
    const menu = this.menu();
    if (!menu) return;

    if (message.isSender) {
      this.activeMessage = message;
      menu.toggle(event);
    }
  }

  private openDeleteMessageDialog() {
    this.confirmModalService.open({
      message: 'Вы уверены, что хотите удалить это сообщение?',
      accept: () => {
        if (!this.activeMessage) return;
        this.messagesStore.deleteMessage(this.activeMessage);
      },
    });
  }

  protected changeCurrentViewLast(value: boolean) {
    this.scrollStateStore.setIsViewLast(value);
  }

  protected firstVisibleHandler(isVisible: boolean) {
    if (!isVisible) return;
    const state = this.dialogsStateStore.currentState();
    if (!(state?.hasNext && !state.isLoading)) return;
    this.scrollStateStore.setPrevScrollHeight(this.elementRef.nativeElement.scrollHeight);
    this.messagesStore.getAdditionalMessagesData({ id: state.id, start: state.messageIds.length });
  }

  protected handleUnreadMessage(message: Message) {
    return (isVisible: boolean) => {
      if (!isVisible) return;
      this.dialogsStateStore.addToUpdateReadStatusMessages(message);
    };
  }
}
