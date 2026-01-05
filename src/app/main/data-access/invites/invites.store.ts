import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { InvitesService } from './invites.service';
import { CreateInviteDto, InviteEntity } from './invites.interface';
import { baseApiState, BaseApiState } from '@app/shared/libs';
import { UserStore } from '@app/core/store/user';
import { mapToInviteView } from './invites.mapper';
import { AlertsService } from '@app/core/alerts';

interface InvitesState extends BaseApiState {
  invites: InviteEntity[];
}

const initialState: InvitesState = {
  ...baseApiState,
  invites: [],
};

export const InvitesStore = signalStore(
  withState(initialState),
  withComputed((store) => {
    const userStore = inject(UserStore);

    return {
      displayInvites: computed(() => {
        return mapToInviteView(store.invites(), userStore.user());
      }),
    };
  }),
  withMethods(
    (store, invitesService = inject(InvitesService), alertService = inject(AlertsService)) => ({
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
      sendInvite: rxMethod<CreateInviteDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((createInviteDto) => {
            return invitesService.create(createInviteDto).pipe(
              tapResponse({
                next: (invite) => {
                  alertService.showSuccessAlert('Запрос на добавление отправлен');
                  patchState(store, (state) => ({ invites: [...state.invites, invite] }));
                },
                error: () => alertService.showErrorAlert('Ошибка отправки запроса'),
                finalize: () => patchState(store, { isPendingAction: false }),
              }),
            );
          }),
        ),
      ),
    }),
  ),
  withHooks({
    onInit: (store) => {
      store.getInvitesData();
    },
  }),
);
