import { AfterViewChecked, Directive, effect, ElementRef, inject, untracked } from '@angular/core';
import { MessagesStateStore } from '../../../data-access/messages';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs';

@Directive({
  selector: '[appScrollBottom]',
})
export class ScrollBottomDirective implements AfterViewChecked {
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly messagesStateStore = inject(MessagesStateStore);
  private readonly currentMessagesState = this.messagesStateStore.currentState;

  constructor() {
    effect((onCleanup) => {
      const dialogId = this.messagesStateStore.currentDialogId();

      onCleanup(() => {
        if (!dialogId) return;

        this.messagesStateStore.setScrollPosition(
          dialogId,
          this.elementRef.nativeElement.scrollTop,
        );

        const state = untracked(() => this.messagesStateStore.getById(dialogId));
        if (!state.isScrolled) return;

        this.messagesStateStore.setIsRestoreScroll(dialogId, true);
      });
    });

    this.messagesStateStore
      .messageAdded$()
      .pipe(
        filter(
          (addedMessage) =>
            addedMessage.contact.id === this.currentMessagesState()?.id &&
            !!this.currentMessagesState()?.isViewLastMessage,
        ),
        tap((addedMessage) => this.messagesStateStore.setScrollAdd(addedMessage.contact.id, true)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  ngAfterViewChecked(): void {
    const state = this.currentMessagesState();
    if (!state) return;

    if (state.isScrolled && state.isRestoreScroll && !state.isLoading && state.isLoaded) {
      this.elementRef.nativeElement.scrollTop = state.scrollPosition;
      this.messagesStateStore.setIsRestoreScroll(state.id, false);
    }

    if (!state.isScrolled && state.isLoaded) {
      this.elementRef.nativeElement.scrollTop = this.elementRef.nativeElement.scrollHeight;
      this.messagesStateStore.setIsScrolled(state.id);
    }

    if (state.isScrollAdd) {
      this.elementRef.nativeElement.scrollTop = this.elementRef.nativeElement.scrollHeight;
      this.messagesStateStore.setScrollAdd(state.id, false);
    }

    if (state.isScrollAdditionaly) {
      const scrollTop = this.elementRef.nativeElement.scrollTop;
      const scrollHeight = this.elementRef.nativeElement.scrollHeight;

      if (scrollTop === 0) {
        this.elementRef.nativeElement.scrollTop = scrollHeight - state.prevScrollHeight;
      }

      this.messagesStateStore.setIsScrollAdditionaly(state.id, false);
    }
  }
}
