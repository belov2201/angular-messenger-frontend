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
import {
  distinctUntilChanged,
  EMPTY,
  filter,
  from,
  fromEvent,
  map,
  merge,
  mergeMap,
  Observable,
  pipe,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { addEntity, removeEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { UserStore } from '@app/core/store/user';
import { Router } from '@angular/router';
import { MessagesStore } from '../messages/messages.store';
import { Message, MessageDto } from '../messages/messages.interface';
import { ContactsStore } from '@app/main/data-access/contacts';
import { WsService } from '@app/main/providers/ws/ws.service';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { Events } from '@ngrx/signals/events';
import { MessagesEvents } from '../messages/messages.events';
import { ContactsEvents } from '@app/main/data-access/contacts/contacts.events';
import { injectCurrentDialogId } from '@app/main/providers/current-dialog-id';

interface DialogState {
  id: number;
  isLoading: boolean;
  isLoaded: boolean;
  hasNext: boolean;
  messageIds: number[];
  updateReadStatusMessages: Message[];
  processUpdateReadStatusMessages: Message[];
}

interface DialogsStateStore {
  currentDialogId: number | null;
}

const createInitialState = (id: number): DialogState => {
  return {
    id,
    isLoading: true,
    isLoaded: false,
    hasNext: true,
    messageIds: [],
    updateReadStatusMessages: [],
    processUpdateReadStatusMessages: [],
  };
};

export const DialogsStateStore = signalStore(
  withEntities<DialogState>(),
  withState<{ updateMessageObservables: Observable<Event>[] }>({ updateMessageObservables: [] }),
  withComputed(
    (store, currentDialogId = injectCurrentDialogId(), contactsStore = inject(ContactsStore)) => ({
      currentState: computed(() => {
        const id = currentDialogId();
        return id !== null ? store.entityMap()[id] : null;
      }),
      currentContact: computed(() => {
        const currentId = currentDialogId();
        if (currentId === null) return;
        return contactsStore.entityMap()[currentId];
      }),
    }),
  ),
  withComputed((store, messagesStore = inject(MessagesStore), userStore = inject(UserStore)) => ({
    currentMessages: computed(() => {
      const messages = messagesStore.entityMap();
      return (store.currentState()?.messageIds ?? []).map((id) => messages[id]).filter(Boolean);
    }),
    currentUpdateReadState: computed(() => {
      return store.currentState()?.updateReadStatusMessages;
    }),
    currentParticipant: computed(() => {
      const currentUser = userStore.user();
      if (!currentUser) return;
      return store.currentContact()?.participants.find((e) => e.id !== currentUser.id);
    }),
    currentTypingContact: computed(() => {
      const contact = store.currentContact();
      const currentUser = userStore.user();
      if (!contact?.isTyping || !currentUser) return;
      return contact.participants.find((e) => e.id !== currentUser.id)?.firstName;
    }),
  })),
  withMethods(
    (
      store,
      messagesStore = inject(MessagesStore),
      router = inject(Router),
      currentDialogId = injectCurrentDialogId(),
    ) => {
      return {
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
        },
        deleteMessage(message: MessageDto) {
          patchState(
            store,
            updateEntity({
              id: message.contact.id,
              changes: (state) => ({
                messageIds: state.messageIds.filter((e) => e !== message.id),
                processUpdateReadStatusMessages: state.processUpdateReadStatusMessages.filter(
                  (e) => e.id !== message.id,
                ),
                updateReadStatusMessages: state.processUpdateReadStatusMessages.filter(
                  (e) => e.id !== message.id,
                ),
              }),
            }),
          );
        },
        addToUpdateReadStatusMessages(message: Message) {
          const processUpdateReadStatusMessages =
            store.entityMap()[message.contact.id].processUpdateReadStatusMessages;

          const updateReadStatusMessages =
            store.entityMap()[message.contact.id].updateReadStatusMessages;

          const isExist = [updateReadStatusMessages, processUpdateReadStatusMessages].some((list) =>
            (list ?? []).some((e) => e.id === message.id),
          );

          if (isExist) return;

          patchState(
            store,
            updateEntity({
              id: message.contact.id,
              changes: (state) => ({
                updateReadStatusMessages: [...state.updateReadStatusMessages, message],
              }),
            }),
          );
        },
        deleteFromUpdateReadStatusMessages(message: Message) {
          patchState(
            store,
            updateEntity({
              id: message.contact.id,
              changes: (state) => ({
                updateReadStatusMessages: state.updateReadStatusMessages.filter(
                  (e) => e.id !== message.id,
                ),
              }),
            }),
          );
        },
        resetUpdateReadStatusMessages() {
          const id = currentDialogId();

          if (id === null || !Number.isInteger(id)) return;

          patchState(
            store,
            updateEntity({
              id,
              changes: {
                updateReadStatusMessages: [],
              },
            }),
          );
        },
        addToProcessUpdateReadStatusMessages(message: Message) {
          patchState(
            store,
            updateEntity({
              id: message.contact.id,
              changes: (state) => ({
                processUpdateReadStatusMessages: [
                  ...state.processUpdateReadStatusMessages,
                  message,
                ],
              }),
            }),
          );
        },
        deleteFromProcessUpdateReadStatusMessages(message: Message) {
          patchState(
            store,
            updateEntity({
              id: message.contact.id,
              changes: (state) => ({
                processUpdateReadStatusMessages: state.processUpdateReadStatusMessages.filter(
                  (e) => e.id !== message.id,
                ),
              }),
            }),
          );
        },
        deleteState(id: number) {
          const deletedState = store.entityMap()[id];

          if (deletedState) {
            messagesStore.deleteMany(deletedState.messageIds);
            patchState(store, removeEntity(id));
          }

          if (id === currentDialogId()) {
            router.navigate(['/'], { replaceUrl: true });
          }
        },
        addToUpdateMessageStatusObservables(observable: Observable<Event>) {
          patchState(store, (state) => ({
            updateMessageObservables: [...state.updateMessageObservables, observable],
          }));
        },
        deleteFromUpdateMessageStatusObservables(observable: Observable<Event>) {
          patchState(store, (state) => ({
            updateMessageObservables: state.updateMessageObservables.filter(
              (e) => e !== observable,
            ),
          }));
        },
      };
    },
  ),
  withMethods((store, wsService = inject(WsService), events = inject(Events)) => ({
    onGetMessagesData: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.getMessagesData).pipe(
            tap((action) => {
              patchState(store, addEntity({ ...createInitialState(action.payload.id) }));
            }),
          ),
        ),
      ),
    ),
    onGetMessagesDataSuccess: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.getMessagesDataSuccess).pipe(
            tap((action) => {
              const { id, messages } = action.payload;

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
                    isLoaded: true,
                    isLoading: false,
                  }),
                }),
              );
            }),
          ),
        ),
      ),
    ),
    onGetMessagesDataError: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.getMessagesDataError).pipe(
            tap((action) => {
              const { id } = action.payload;
              patchState(
                store,
                updateEntity({
                  id,
                  changes: {
                    isLoaded: true,
                    isLoading: false,
                  },
                }),
              );
            }),
          ),
        ),
      ),
    ),
    onGetMessagesDataAdditionaly: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.getMessagesDataAdditionaly).pipe(
            tap((action) =>
              patchState(
                store,
                updateEntity({
                  id: action.payload.id,
                  changes: {
                    isLoading: true,
                  },
                }),
              ),
            ),
          ),
        ),
      ),
    ),
    onGetMessagesDataAdditionalySuccess: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.getMessagesDataAdditionalySuccess).pipe(
            tap((action) => {
              const { id, messages } = action.payload;
              patchState(
                store,
                updateEntity({
                  id,
                  changes: (state) => ({
                    messageIds: [
                      ...messages.map((e) => e.id).sort((a, b) => a - b),
                      ...state.messageIds,
                    ],
                    hasNext: messages.length === 50,
                    isLoading: false,
                  }),
                }),
              );
            }),
          ),
        ),
      ),
    ),
    onGetMessagesDataAdditionallyError: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.getMessagesDataAdditionalyError).pipe(
            tap((action) => {
              const { id } = action.payload;
              patchState(
                store,
                updateEntity({
                  id,
                  changes: {
                    isLoading: false,
                  },
                }),
              );
            }),
          ),
        ),
      ),
    ),
    onAddMessage: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.add).pipe(tap((action) => store.addMessage(action.payload))),
        ),
      ),
    ),
    onDeleteMessage: rxMethod<void>(
      pipe(
        switchMap(() =>
          events
            .on(MessagesEvents.delete)
            .pipe(tap((action) => store.deleteMessage(action.payload))),
        ),
      ),
    ),
    onDeleteWsContact: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<number>(WsEvents.deleteContact)),
        tap((id) => store.deleteState(id)),
      ),
    ),
    onDeleteContact: rxMethod<void>(
      pipe(
        switchMap(() =>
          events
            .on(ContactsEvents.delete)
            .pipe(tap((action) => store.deleteState(action.payload.id))),
        ),
      ),
    ),
    onUpdateReadStatusMessage: rxMethod<void>(
      pipe(
        switchMap(() =>
          events
            .on(MessagesEvents.updateReadStatusMessage)
            .pipe(tap((action) => store.addToProcessUpdateReadStatusMessages(action.payload))),
        ),
      ),
    ),
    onUpdateReadStatusMessageError: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.updateReadStatusMessageError).pipe(
            tap((action) => store.deleteFromProcessUpdateReadStatusMessages(action.payload)),
            tap((action) => store.addToUpdateReadStatusMessages(action.payload)),
          ),
        ),
      ),
    ),
  })),
  withMethods((store, messagesStore = inject(MessagesStore)) => ({
    updateReadStateMessagesObserve: rxMethod<Message[] | undefined>(
      pipe(
        map((data) => (data ?? []).length > 0),
        distinctUntilChanged(),
        switchMap((hasMessages) => {
          if (hasMessages) {
            return merge(fromEvent(window, 'mousemove'), ...store.updateMessageObservables()).pipe(
              throttleTime(500),
              map(() => store.currentState()),
              filter((state) => !!state),
              map((state) => state.updateReadStatusMessages),
              filter((e) => e.length > 0),
              tap(() => store.resetUpdateReadStatusMessages()),
              mergeMap((updateReadStatusMessage) =>
                from(updateReadStatusMessage).pipe(tap(messagesStore.updateStatusMessage)),
              ),
            );
          }

          return EMPTY;
        }),
      ),
    ),
  })),
  withMethods((store, messagesStore = inject(MessagesStore)) => ({
    loadMessages: rxMethod<number | null>(
      pipe(
        map((id) => (id === null ? null : Number(id))),
        tap((id) => {
          if (id !== null && Number.isInteger(id)) {
            if (!store.entityMap()[id]) {
              messagesStore.getMessagesData(id);
            }
          }
        }),
      ),
    ),
  })),
  withHooks({
    onInit: (store, currentDialogId = injectCurrentDialogId()) => {
      store.onDeleteWsContact();
      store.onDeleteContact();
      store.updateReadStateMessagesObserve(store.currentUpdateReadState);
      store.onGetMessagesData();
      store.onGetMessagesDataSuccess();
      store.onGetMessagesDataError();
      store.onGetMessagesDataAdditionaly();
      store.onGetMessagesDataAdditionalySuccess();
      store.onGetMessagesDataAdditionallyError();
      store.onAddMessage();
      store.onDeleteMessage();
      store.onUpdateReadStatusMessage();
      store.onUpdateReadStatusMessageError();
      store.loadMessages(currentDialogId);
    },
  }),
);
