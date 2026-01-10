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
import { filter, map, mergeMap, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AlertsService } from '@app/core/alerts';
import { addEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { MessagesService } from './messages.service';
import { mapToMessageView } from './messages.mapper';
import { UserStore } from '@app/core/store/user';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesStore } from './messages.store';
import { CreateMessageDto, Message, SendMessageParam } from './messages.interface';
import { ContactsStore } from '@app/main/data-access/contacts';
import { createOptimisticMessage, getCreateMessageDto } from './lib';

interface MessagesState {
  id: number;
  isLoading: boolean;
  isLoaded: boolean;
  messageIds: number[];
  loadingMessages: Message[];
  errorMessages: Message[];
  isScrolled: boolean;
}

interface MessagesStateStore {
  currentDialogId: number | null;
}

const createInitialState = (id: number): MessagesState => {
  return {
    id,
    isLoading: true,
    isLoaded: false,
    messageIds: [],
    loadingMessages: [],
    errorMessages: [],
    isScrolled: false,
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
      const messages = messagesStore.entityMap();
      return (store.currentState()?.messageIds ?? []).map((id) => messages[id]).filter(Boolean);
    }),
  })),
  withMethods((store, messagesStore = inject(MessagesStore)) => ({
    addMessage(message: Message) {
      patchState(
        store,
        updateEntity({
          id: message.contact.id,
          changes: (state) => ({
            messageIds: [...state.messageIds, message.id],
          }),
        }),
      );

      messagesStore.addOne(message);
    },
    updateMessageId(
      prevId: number,
      currentMessage: Partial<Message> & Pick<Message, 'id' | 'contact'>,
    ) {
      patchState(
        store,
        updateEntity({
          id: currentMessage.contact.id,
          changes: (state) => ({
            messageIds: [...state.messageIds, currentMessage.id].filter((e) => e !== prevId),
          }),
        }),
      );

      messagesStore.updateOne(prevId, currentMessage);
    },
  })),
  withMethods(
    (
      store,
      messagesService = inject(MessagesService),
      alertService = inject(AlertsService),
      userStore = inject(UserStore),
      messagesStore = inject(MessagesStore),
      contactsStore = inject(ContactsStore),
      router = inject(Router),
    ) => ({
      setCurrentDialogId(value: number | null) {
        patchState(store, { currentDialogId: value });
      },
      setIsScrolled(id: number) {
        patchState(store, updateEntity({ id, changes: { isScrolled: true } }));
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
                        messageIds: [
                          ...state.messageIds,
                          ...messages.map((e) => e.id).sort((a, b) => a - b),
                        ],
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
                  patchState(
                    store,
                    updateEntity({ id, changes: { isLoading: false, isLoaded: true } }),
                  ),
              }),
            );
          }),
        ),
      ),
      sendMessage: rxMethod<SendMessageParam>(
        pipe(
          map(
            (
              sendMessageParam,
            ): { createMessageDto: CreateMessageDto; createdMessage: Message } | null => {
              const user = userStore.user();
              if (!user) return null;

              const createMessageDto = getCreateMessageDto(sendMessageParam, user);
              const createdMessage = createOptimisticMessage(createMessageDto, user);

              return { createMessageDto, createdMessage };
            },
          ),
          filter((e) => !!e),
          tap(({ createdMessage }) => {
            store.addMessage(createdMessage);
          }),
          mergeMap(({ createMessageDto, createdMessage }) =>
            messagesService.create(createMessageDto).pipe(
              tapResponse({
                next: (message) => {
                  store.updateMessageId(createdMessage.id, { ...message, status: 'sent' });
                  contactsStore.updateLastMessage(createdMessage.contact.id, {
                    ...createdMessage,
                    ...message,
                  });
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка отправки сообщения');
                  messagesStore.updateOne(createdMessage.id, { status: 'error' });
                },
              }),
            ),
          ),
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
