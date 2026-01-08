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
import { map, mergeMap, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AlertsService } from '@app/core/alerts';
import { addEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { MessagesService } from './messages.service';
import { mapToMessageView } from './messages.mapper';
import { UserStore } from '@app/core/store/user';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesStore } from './messages.store';

interface MessagesState {
  id: number;
  isLoading: boolean;
  messageIds: number[];
}

interface MessagesStateStore {
  currentDialogId: number | null;
}

const createInitialState = (id: number): MessagesState => {
  return {
    id,
    isLoading: true,
    messageIds: [],
  };
};

export const MessagesStateStore = signalStore(
  withState<MessagesStateStore>(() => ({
    currentDialogId: null,
  })),
  withEntities<MessagesState>(),
  withComputed((store) => ({
    currentState: computed(() => {
      const id = store.currentDialogId();
      return id !== null ? store.entityMap()[id] : null;
    }),
  })),
  withComputed((store, messagesStore = inject(MessagesStore)) => ({
    currentMessages: computed(() => {
      const allMessages = messagesStore.entityMap();
      return (store.currentState()?.messageIds ?? []).map((id) => allMessages[id]).filter(Boolean);
    }),
  })),
  withMethods(
    (
      store,
      messagesService = inject(MessagesService),
      alertService = inject(AlertsService),
      userStore = inject(UserStore),
      messagesStore = inject(MessagesStore),
      router = inject(Router),
    ) => ({
      setCurrentDialogId(value: number | null) {
        patchState(store, { currentDialogId: value });
      },
      getMessagesData: rxMethod<number>(
        pipe(
          mergeMap((id) => {
            return messagesService.getAll(id).pipe(
              map((messages) =>
                messages
                  .map((message) => mapToMessageView(message, userStore.user()))
                  .filter((e) => !!e),
              ),
              tapResponse({
                next: (messages) => {
                  patchState(
                    store,
                    updateEntity({
                      id,
                      changes: (state) => ({
                        messageIds: [...state.messageIds, ...messages.map((e) => e.id)],
                      }),
                    }),
                  );

                  messagesStore.addMany(messages);
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка получения сообщений');
                  router.navigate(['/'], { replaceUrl: true });
                },
                finalize: () =>
                  patchState(store, updateEntity({ id, changes: { isLoading: false } })),
              }),
            );
          }),
        ),
      ),
      getById(id: number) {
        return store.entityMap()[id];
      },
    }),
  ),
  withMethods((store, router = inject(ActivatedRoute)) => {
    return {
      loadData: rxMethod<void>(
        pipe(
          switchMap(() => router.paramMap),
          map((paramMap) => paramMap.get('dialogId')),
          map((id) => (id === null ? null : Number(id))),
          tap((id) => {
            if (id !== null && Number.isInteger(id)) {
              if (!store.entityMap()[id]) {
                patchState(store, addEntity({ ...createInitialState(id) }));
                store.getMessagesData(id);
              }

              store.setCurrentDialogId(id);
            } else {
              store.setCurrentDialogId(null);
            }
          }),
        ),
      ),
    };
  }),
  withHooks({
    onInit: (store) => {
      store.loadData();
    },
  }),
);
