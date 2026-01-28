import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals';
import {
  addEntities,
  addEntity,
  EntityId,
  removeEntities,
  removeEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import {
  CreateMessageDto,
  DeleteMessageWsDto,
  Message,
  MessageDto,
  SendMessageParam,
} from './messages.interface';
import { WsService } from '@app/main/providers/ws/ws.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, map, mergeMap, pipe, switchMap, tap } from 'rxjs';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { inject } from '@angular/core';
import { MessagesService } from './messages.service';
import { tapResponse } from '@ngrx/operators';
import { AlertsService } from '@app/core/alerts';
import { ContactsStore } from '@app/main/data-access/contacts';
import { injectDispatch } from '@ngrx/signals/events';
import { UserStore } from '@app/core/store/user';
import { createOptimisticMessage, getCreateMessageDto } from './lib';
import { mapToMessageView } from './messages.mapper';
import { Router } from '@angular/router';
import { MessagesEvents } from './messages.events';

export const MessagesStore = signalStore(
  withEntities<Message>(),
  withMethods((store) => ({
    deleteMany: (ids: EntityId[]) => patchState(store, removeEntities(ids)),
  })),
  withMethods(
    (
      store,
      messagesService = inject(MessagesService),
      alertService = inject(AlertsService),
      userStore = inject(UserStore),
      contactsStore = inject(ContactsStore),
      router = inject(Router),
      dispatchMessageEvent = injectDispatch(MessagesEvents),
    ) => ({
      getMessagesData: rxMethod<number>(
        pipe(
          tap((id) => {
            dispatchMessageEvent.getMessagesData({ id });
          }),
          mergeMap((id) => {
            return messagesService.getAll(id).pipe(
              map((messages) =>
                messages
                  .map((message) => mapToMessageView(message, userStore.user()))
                  .filter((e) => !!e),
              ),
              tapResponse({
                next: (messages) => {
                  dispatchMessageEvent.getMessagesDataSuccess({ id, messages });
                  patchState(store, addEntities(messages));
                },
                error: () => {
                  dispatchMessageEvent.getMessagesDataError({ id });
                  alertService.showErrorAlert('Ошибка получения сообщений');
                  router.navigate(['/'], { replaceUrl: true });
                },
              }),
            );
          }),
        ),
      ),
      getAdditionalMessagesData: rxMethod<{ id: number; start: number }>(
        pipe(
          tap(({ id }) => {
            dispatchMessageEvent.getMessagesDataAdditionaly({ id });
          }),
          mergeMap(({ id, start }) => {
            return messagesService.getAll(id, start).pipe(
              map((messages) =>
                messages
                  .map((message) => mapToMessageView(message, userStore.user()))
                  .filter((e) => !!e),
              ),
              tapResponse({
                next: (messages) => {
                  patchState(store, addEntities(messages));
                  dispatchMessageEvent.getMessagesDataAdditionalySuccess({
                    id,
                    messages,
                  });
                },
                error: () => {
                  dispatchMessageEvent.getMessagesDataAdditionalyError({
                    id,
                  });

                  alertService.showErrorAlert('Ошибка получения сообщений');
                  router.navigate(['/'], { replaceUrl: true });
                },
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
            patchState(store, addEntity(createdMessage));
            dispatchMessageEvent.add(createdMessage);
          }),
          mergeMap(({ createMessageDto, createdMessage }) =>
            messagesService.create(createMessageDto).pipe(
              tapResponse({
                next: (message) => {
                  patchState(
                    store,
                    updateEntity({
                      id: createdMessage.id,
                      changes: { ...message, status: 'sent' },
                    }),
                  );
                  dispatchMessageEvent.delete(createdMessage);

                  const updatedMessage = {
                    ...createdMessage,
                    ...message,
                  };

                  dispatchMessageEvent.add(updatedMessage);
                  contactsStore.updateLastMessage(createdMessage.contact.id, updatedMessage);
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка отправки сообщения');
                  patchState(
                    store,
                    updateEntity({ id: createdMessage.id, changes: { status: 'error' } }),
                  );
                },
              }),
            ),
          ),
        ),
      ),
      editMessage: rxMethod<{ message: Message; text: string }>(
        pipe(
          tap(({ message, text }) => {
            patchState(
              store,
              updateEntity({ id: message.id, changes: { text, status: 'loading' } }),
            );
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
                  patchState(
                    store,
                    updateEntity({ id: message.id, changes: { text: message.text } }),
                  );

                  alertService.showErrorAlert('Ошибка редактирования сообщения');
                },
                finalize: () => {
                  patchState(store, updateEntity({ id: message.id, changes: { status: 'sent' } }));
                },
              }),
            ),
          ),
        ),
      ),
      deleteMessage: rxMethod<Message>(
        pipe(
          tap((message) => {
            patchState(store, updateEntity({ id: message.id, changes: { status: 'loading' } }));
          }),
          mergeMap((message) =>
            messagesService.delete({ id: message.id }).pipe(
              tapResponse({
                next: (deleteMessageResponse) => {
                  dispatchMessageEvent.delete(message);
                  contactsStore.deleteLastMessage(message.contact.id, {
                    deletedMessage: message,
                    newMessage: deleteMessageResponse.prevMessage,
                  });
                  patchState(store, removeEntity(message.id));
                  alertService.showSuccessAlert('Сообщение удалено');
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка удаления сообщения');
                  patchState(store, updateEntity({ id: message.id, changes: { status: 'sent' } }));
                },
              }),
            ),
          ),
        ),
      ),
      updateStatusMessage: rxMethod<Message>(
        pipe(
          tap((message) => {
            dispatchMessageEvent.updateReadStatusMessage(message);
          }),
          mergeMap((message) =>
            messagesService.edit({ id: message.id, isRead: true }).pipe(
              tapResponse({
                next: () => {
                  patchState(store, updateEntity({ id: message.id, changes: { isRead: true } }));
                  contactsStore.updateNoReadCount(message.contact.id, 'decrement');
                  contactsStore.updateLastMessage(message.contact.id, {
                    ...message,
                    isRead: true,
                  });
                },
                error: () => {
                  dispatchMessageEvent.updateReadStatusMessageError(message);
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
  withMethods(
    (
      store,
      wsService = inject(WsService),
      userStore = inject(UserStore),
      messagesEventDispatch = injectDispatch(MessagesEvents),
    ) => ({
      addWsMessage: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.addMessage)),
          tap((messageDto) => {
            const user = userStore.user();
            const message = mapToMessageView(messageDto, user);
            if (!message) return;
            patchState(store, addEntity(message));
            messagesEventDispatch.add(message);
          }),
        ),
      ),
      updateWsMessage: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.updateMessage)),
          tap((messageDto) => {
            patchState(store, updateEntity({ id: messageDto.id, changes: { ...messageDto } }));
          }),
        ),
      ),
      updateReadStateWs: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.updateReadStateMessage)),
          tap((messageDto) =>
            patchState(store, updateEntity({ id: messageDto.id, changes: { ...messageDto } })),
          ),
        ),
      ),
      deleteWsMessage: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<DeleteMessageWsDto>(WsEvents.deleteMessage)),
          tap(({ removedMessage }) => {
            patchState(store, removeEntity(removedMessage.id));
            messagesEventDispatch.delete(removedMessage);
          }),
        ),
      ),
    }),
  ),
  withHooks({
    onInit: (store) => {
      store.updateReadStateWs();
      store.addWsMessage();
      store.updateWsMessage();
      store.deleteWsMessage();
    },
  }),
);
