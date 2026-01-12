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
import { filter, map, mergeMap, pipe, Subject, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AlertsService } from '@app/core/alerts';
import { addEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { MessagesService } from './messages.service';
import { mapToMessageView } from './messages.mapper';
import { UserStore } from '@app/core/store/user';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesStore } from './messages.store';
import {
  CreateMessageDto,
  DeleteMessageWsDto,
  Message,
  MessageDto,
  SendMessageParam,
} from './messages.interface';
import { ContactsStore } from '@app/main/data-access/contacts';
import { createOptimisticMessage, getCreateMessageDto } from './lib';
import { ScrollStateStore } from '../scroll';
import { WsService } from '@app/main/providers/ws/ws.service';
import { WsEvents } from '@app/main/providers/ws/ws-events';

interface MessagesState {
  id: number;
  isLoading: boolean;
  isLoaded: boolean;
  hasNext: boolean;
  messageIds: number[];
  isViewLastMessage: boolean;
}

interface MessagesStateStore {
  currentDialogId: number | null;
}

const createInitialState = (id: number): MessagesState => {
  return {
    id,
    isLoading: true,
    isLoaded: false,
    hasNext: true,
    messageIds: [],
    isViewLastMessage: false,
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
  withMethods((store, messagesStore = inject(MessagesStore)) => {
    const addMessageSubject = new Subject<Message>();

    return {
      messageAdded$: () => addMessageSubject.asObservable(),
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
        addMessageSubject.next(message);
      },
      deleteMessageStore(message: MessageDto) {
        patchState(
          store,
          updateEntity({
            id: message.contact.id,
            changes: (state) => ({
              messageIds: state.messageIds.filter((e) => e !== message.id),
            }),
          }),
        );

        messagesStore.deleteOne(message.id);
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
    };
  }),
  withMethods(
    (
      store,
      messagesService = inject(MessagesService),
      alertService = inject(AlertsService),
      userStore = inject(UserStore),
      messagesStore = inject(MessagesStore),
      contactsStore = inject(ContactsStore),
      scrollStore = inject(ScrollStateStore),
      router = inject(Router),
    ) => ({
      setCurrentDialogId(value: number | null) {
        patchState(store, { currentDialogId: value });
      },
      setIsViewLast(value: boolean) {
        if (!Number.isInteger(store.currentDialogId())) return;

        patchState(
          store,
          updateEntity({ id: store.currentDialogId()!, changes: { isViewLastMessage: value } }),
        );
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
                        hasNext: messages.length === 50,
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
      getAdditionalMessagesData: rxMethod<void>(
        pipe(
          map(() => store.currentState()),
          filter((currentState) => !!currentState),
          filter((currentState) => currentState.hasNext && !currentState.isLoading),
          tap((currentState) =>
            patchState(
              store,
              updateEntity({
                id: currentState.id,
                changes: {
                  isLoading: true,
                },
              }),
            ),
          ),
          mergeMap((currentState) => {
            return messagesService.getAll(currentState.id, currentState.messageIds.length).pipe(
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
                      id: currentState.id,
                      changes: (state) => ({
                        messageIds: [
                          ...messages.map((e) => e.id).sort((a, b) => a - b),
                          ...state.messageIds,
                        ],
                        hasNext: messages.length === 50,
                      }),
                    }),
                  );

                  messagesStore.addMany(messages);
                  scrollStore.setIsScrollAdditionaly(currentState.id, true);
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка получения сообщений');
                  router.navigate(['/'], { replaceUrl: true });
                },
                finalize: () =>
                  patchState(
                    store,
                    updateEntity({ id: currentState.id, changes: { isLoading: false } }),
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
      editMessage: rxMethod<{ message: Message; text: string }>(
        pipe(
          tap(({ message, text }) => {
            messagesStore.updateOne(message.id, { text, status: 'loading' });
          }),
          mergeMap(({ message, text }) =>
            messagesService.edit({ id: message.id, text }).pipe(
              tapResponse({
                next: () => {
                  contactsStore.updateLastMessage(message.contact.id, {
                    ...message,
                    text,
                  });

                  alertService.showSuccessAlert('Сообщение отредактировано');
                },
                error: () => {
                  messagesStore.updateOne(message.id, { text: message.text });
                  alertService.showErrorAlert('Ошибка редактирования сообщения');
                },
                finalize: () => {
                  messagesStore.updateOne(message.id, { status: 'sent' });
                },
              }),
            ),
          ),
        ),
      ),
      deleteMessage: rxMethod<Message>(
        pipe(
          tap((message) => {
            messagesStore.updateOne(message.id, { status: 'loading' });
          }),
          mergeMap((message) =>
            messagesService.delete({ id: message.id }).pipe(
              tapResponse({
                next: (deleteMessageResponse) => {
                  store.deleteMessageStore(message);
                  contactsStore.deleteLastMessage(message.contact.id, {
                    deletedMessage: message,
                    newMessage: deleteMessageResponse.prevMessage,
                  });
                  alertService.showSuccessAlert('Сообщение удалено');
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка удаления сообщения');
                  messagesStore.updateOne(message.id, { status: 'sent' });
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
  withMethods(
    (
      store,
      wsService = inject(WsService),
      messagesStore = inject(MessagesStore),
      userStore = inject(UserStore),
    ) => ({
      addWsMessage: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.addMessage)),
          tap((messageDto) => {
            const user = userStore.user();
            const message = mapToMessageView(messageDto, user);
            if (!message) return;
            messagesStore.addOne(message);
            store.addMessage(message);
          }),
        ),
      ),
      updateWsMessage: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.updateMessage)),
          tap((messageDto) => messagesStore.updateOne(messageDto.id, messageDto)),
        ),
      ),
      deleteWsMessage: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<DeleteMessageWsDto>(WsEvents.deleteMessage)),
          tap(({ removedMessage }) => store.deleteMessageStore(removedMessage)),
        ),
      ),
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
      store.addWsMessage();
      store.updateWsMessage();
      store.deleteWsMessage();
    },
  }),
);
