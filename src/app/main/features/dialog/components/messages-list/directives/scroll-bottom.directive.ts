import { AfterViewChecked, Directive, ElementRef, inject } from '@angular/core';
import { MessagesStateStore } from '../../../data-access/messages';

@Directive({
  selector: '[appScrollBottom]',
})
export class ScrollBottomDirective implements AfterViewChecked {
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly messagesStateStore = inject(MessagesStateStore);
  private readonly currentMessagesState = this.messagesStateStore.currentState;

  ngAfterViewChecked(): void {
    const state = this.currentMessagesState();
    if (!state) return;

    if (!state.isScrolled && state.isLoaded) {
      this.elementRef.nativeElement.scrollTop = this.elementRef.nativeElement.scrollHeight;
      this.messagesStateStore.setIsScrolled(state.id);
    }
  }
}
