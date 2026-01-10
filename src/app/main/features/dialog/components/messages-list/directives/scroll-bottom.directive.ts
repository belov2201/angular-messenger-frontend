import { AfterViewChecked, Directive, ElementRef, inject } from '@angular/core';
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

    if (!state.isScrolled && state.isLoaded) {
      this.elementRef.nativeElement.scrollTop = this.elementRef.nativeElement.scrollHeight;
      this.messagesStateStore.setIsScrolled(state.id);
    }

    if (state.isScrollAdd) {
      this.elementRef.nativeElement.scrollTop = this.elementRef.nativeElement.scrollHeight;
      this.messagesStateStore.setScrollAdd(state.id, false);
    }
  }
}
