import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';

@Injectable()
export class CurrentDialogIdService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly value = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        if (!this.activatedRoute.firstChild) return null;
        const dialogId = this.activatedRoute.firstChild.snapshot?.paramMap.get('dialogId');
        return dialogId !== null ? Number(dialogId) : null;
      }),
      distinctUntilChanged(),
    ),
    { initialValue: null },
  );
}

export const injectCurrentDialogId = () => inject(CurrentDialogIdService).value;
