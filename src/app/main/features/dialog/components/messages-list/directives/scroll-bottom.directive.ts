import { AfterViewChecked, Directive, effect, ElementRef, inject, untracked } from '@angular/core';
import { ScrollStateStore } from '../../../data-access/scroll';
import { DialogsStateStore } from '../../../data-access/dialogs-state';

@Directive({
  selector: '[appScrollBottom]',
})
export class ScrollBottomDirective implements AfterViewChecked {
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly dialogsStateStore = inject(DialogsStateStore);
  private readonly scrollStateStore = inject(ScrollStateStore);

  private readonly currentDialogState = this.dialogsStateStore.currentState;

  constructor() {
    effect((onCleanup) => {
      const dialogId = this.scrollStateStore.currentDialogId();

      onCleanup(() => {
        if (!dialogId) return;
        this.scrollStateStore.setScrollPosition(dialogId, this.elementRef.nativeElement.scrollTop);
        const state = untracked(() => this.scrollStateStore.getById(dialogId));
        if (!state.isScrolled) return;
        this.scrollStateStore.setIsRestoreScroll(dialogId, true);
      });
    });
  }

  ngAfterViewChecked(): void {
    const currentMessagesState = this.currentDialogState();
    const currentScrollState = this.scrollStateStore.currentState();

    if (!currentMessagesState || !currentScrollState) return;

    if (
      currentScrollState.isScrolled &&
      currentScrollState.isRestoreScroll &&
      !currentMessagesState.isLoading &&
      currentMessagesState.isLoaded
    ) {
      this.elementRef.nativeElement.scrollTop = currentScrollState.scrollPosition;
      this.scrollStateStore.setIsRestoreScroll(currentScrollState.id, false);
    }

    if (!currentScrollState.isScrolled && currentMessagesState.isLoaded) {
      this.elementRef.nativeElement.scrollTop = this.elementRef.nativeElement.scrollHeight;
      this.scrollStateStore.setIsScrolled(currentScrollState.id);
    }

    if (currentScrollState.isScrollAdd) {
      this.elementRef.nativeElement.scrollTop = this.elementRef.nativeElement.scrollHeight;
      this.scrollStateStore.setScrollAdd(currentMessagesState.id, false);
    }

    if (currentScrollState.isScrollAdditionaly) {
      const scrollTop = this.elementRef.nativeElement.scrollTop;
      const scrollHeight = this.elementRef.nativeElement.scrollHeight;

      if (scrollTop === 0) {
        this.elementRef.nativeElement.scrollTop =
          scrollHeight - currentScrollState.prevScrollHeight;
      }

      this.scrollStateStore.setIsScrollAdditionaly(currentMessagesState.id, false);
    }
  }
}
