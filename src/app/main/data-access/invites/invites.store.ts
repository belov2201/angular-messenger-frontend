import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { InvitesService } from './invites.service';
import { InviteEntity } from './invites.interface';

interface InvitesState {
  invites: InviteEntity[];
  isPendingAction: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
}

const initialState: InvitesState = {
  invites: [],
  isPendingAction: false,
  isLoading: false,
  isLoaded: false,
  isError: false,
};

export const InvitesStore = signalStore(
  withState(initialState),
  withMethods((store, invitesService = inject(InvitesService)) => ({
    getInvitesData: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          return invitesService.getAll().pipe(
            tapResponse({
              next: (invites) => patchState(store, { invites }),
              error: () => patchState(store, { isError: true }),
              finalize: () => patchState(store, { isLoaded: true, isLoading: false }),
            }),
          );
        }),
      ),
    ),
  })),
  withHooks({
    onInit: (store) => {
      store.getInvitesData();
    },
  }),
);
