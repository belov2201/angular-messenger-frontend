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
import { filter, from, map, pipe, switchMap, tap, toArray } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { baseApiState } from '@app/shared/libs';
import { AlertsService } from '@app/core/alerts';
import { addEntities, withEntities } from '@ngrx/signals/entities';
import { MessagesService } from './messages.service';
import { Message } from './messages.interface';
import { mapToMessageView } from './messages.mapper';
import { UserStore } from '@app/core/store/user';

export const MessagesStore = signalStore(
  withState(baseApiState),
  withEntities<Message>(),
  withComputed((store) => ({
    sortedMessages: computed(() => store.entities().sort((a, b) => a.id - b.id)),
  })),
  withMethods(
    (
      store,
      messagesService = inject(MessagesService),
      alertService = inject(AlertsService),
      userStore = inject(UserStore),
    ) => ({
      getMessagesData: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return messagesService.getAll(45).pipe(
              switchMap((messages) =>
                from(messages).pipe(
                  map((message) => mapToMessageView(message, userStore.user())),
                  filter((message) => !!message),
                  toArray(),
                ),
              ),
              tapResponse({
                next: (messages) => patchState(store, addEntities(messages)),
                error: () => {
                  alertService.showErrorAlert('Ошибка получения сообщений');
                },
                finalize: () => patchState(store, { isLoaded: true, isLoading: false }),
              }),
            );
          }),
        ),
      ),
    }),
  ),
  withHooks({
    onInit: (store) => {
      store.getMessagesData();
    },
  }),
);
