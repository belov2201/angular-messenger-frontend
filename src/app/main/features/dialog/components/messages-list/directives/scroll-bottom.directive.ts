import { AfterViewChecked, Directive, ElementRef, inject, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { DialogsStateStore } from '@app/main/data-access/dialogs-state';
import { ScrollStateStore } from '@app/main/data-access/scroll';
import { injectCurrentDialogId } from '@app/main/providers/current-dialog-id';
import { filter, tap } from 'rxjs';

@Directive({
  selector: '[appScrollBottom]',
})
export class ScrollBottomDirective implements AfterViewChecked {
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly dialogsStateStore = inject(DialogsStateStore);
  private readonly scrollStateStore = inject(ScrollStateStore);
  private readonly router = inject(Router);
  private readonly currentDialogId = injectCurrentDialogId();

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationStart),
        tap(() => {
          const dialogId = this.currentDialogId();
          if (dialogId === null) return;

          this.scrollStateStore.setScrollPosition(
            dialogId,
            this.elementRef.nativeElement.scrollTop,
          );

          const state = untracked(() => this.scrollStateStore.getById(dialogId));

          if (!state.isScrolled) return;
          this.scrollStateStore.setIsRestoreScroll(dialogId, true);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  ngAfterViewChecked(): void {
    const currentMessagesState = this.dialogsStateStore.currentState();
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
