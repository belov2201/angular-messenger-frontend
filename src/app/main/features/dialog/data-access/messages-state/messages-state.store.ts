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
  mergeMap,
  pipe,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { addEntity, removeEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { UserStore } from '@app/core/store/user';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesStore } from '../messages/messages.store';
import { Message, MessageDto } from '../messages/messages.interface';
import { ContactsStore } from '@app/main/data-access/contacts';
import { WsService } from '@app/main/providers/ws/ws.service';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { Events } from '@ngrx/signals/events';
import { MessageEvents } from '../messages/message.events';

interface MessagesState {
  id: number;
  isLoading: boolean;
  isLoaded: boolean;
  hasNext: boolean;
  messageIds: number[];
  updateReadStatusMessages: Message[];
  processUpdateReadStatusMessages: Message[];
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
    updateReadStatusMessages: [],
    processUpdateReadStatusMessages: [],
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
  withComputed(
    (
      store,
      messagesStore = inject(MessagesStore),
      contactsStore = inject(ContactsStore),
      userStore = inject(UserStore),
    ) => ({
      currentMessages: computed(() => {
        const messages = messagesStore.entityMap();
        return (store.currentState()?.messageIds ?? []).map((id) => messages[id]).filter(Boolean);
      }),
      currentUpdateReadState: computed(() => {
        return store.currentState()?.updateReadStatusMessages;
      }),
      currentTypingContact: computed(() => {
        const currentId = store.currentDialogId();
        if (currentId === null) return;
        const contact = contactsStore.entityMap()[currentId];
        const currentUser = userStore.user();
        if (!contact?.isTyping || !currentUser) return;
        return contact.participants.find((e) => e.id !== currentUser.id)?.firstName;
      }),
    }),
  ),
  withMethods((store) => {
    return {
      setCurrentDialogId(value: number | null) {
        patchState(store, { currentDialogId: value });
      },
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
        const currentDialogId = store.currentDialogId();

        if (currentDialogId === null || !Number.isInteger(currentDialogId)) return;

        patchState(
          store,
          updateEntity({
            id: currentDialogId,
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
              processUpdateReadStatusMessages: [...state.processUpdateReadStatusMessages, message],
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
    };
  }),
  withMethods(
    (
      store,
      wsService = inject(WsService),
      messagesStore = inject(MessagesStore),
      router = inject(Router),
      events = inject(Events),
    ) => ({
      onGetMessagesData: rxMethod<void>(
        pipe(
          switchMap(() =>
            events.on(MessageEvents.getMessagesData).pipe(
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
            events.on(MessageEvents.getMessagesDataSuccess).pipe(
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
            events.on(MessageEvents.getMessagesDataError).pipe(
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
            events.on(MessageEvents.getMessagesDataAdditionaly).pipe(
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
            events.on(MessageEvents.getMessagesDataAdditionalySuccess).pipe(
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
            events.on(MessageEvents.getMessagesDataAdditionalyError).pipe(
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
            events.on(MessageEvents.add).pipe(tap((action) => store.addMessage(action.payload))),
          ),
        ),
      ),
      onDeleteMessage: rxMethod<void>(
        pipe(
          switchMap(() =>
            events
              .on(MessageEvents.delete)
              .pipe(tap((action) => store.deleteMessage(action.payload))),
          ),
        ),
      ),
      onDeleteWsContact: rxMethod<void>(
        pipe(
          switchMap(() => wsService.socket.fromEvent<number>(WsEvents.deleteContact)),
          tap((id) => {
            const deletedState = store.entityMap()[id];
            messagesStore.deleteMany(deletedState.messageIds);
            patchState(store, removeEntity(id));
            if (id === store.currentDialogId()) {
              router.navigate(['/'], { replaceUrl: true });
            }
          }),
        ),
      ),
      onUpdateReadStatusMessage: rxMethod<void>(
        pipe(
          switchMap(() =>
            events
              .on(MessageEvents.updateReadStatusMessage)
              .pipe(tap((action) => store.addToProcessUpdateReadStatusMessages(action.payload))),
          ),
        ),
      ),
      onUpdateReadStatusMessageError: rxMethod<void>(
        pipe(
          switchMap(() =>
            events.on(MessageEvents.updateReadStatusMessageError).pipe(
              tap((action) => store.deleteFromProcessUpdateReadStatusMessages(action.payload)),
              tap((action) => store.addToUpdateReadStatusMessages(action.payload)),
            ),
          ),
        ),
      ),
    }),
  ),
  withMethods((store, messagesStore = inject(MessagesStore)) => ({
    updateReadStateMessagesObserve: rxMethod<Message[] | undefined>(
      pipe(
        map((data) => (data ?? []).length > 0),
        distinctUntilChanged(),
        switchMap((hasMessages) => {
          if (hasMessages) {
            return fromEvent(window, 'mousemove').pipe(
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
  withMethods((store, messagesStore = inject(MessagesStore), router = inject(ActivatedRoute)) => ({
    loadMessages: rxMethod<void>(
      pipe(
        switchMap(() => router.paramMap),
        map((paramMap) => paramMap.get('dialogId')),
        map((id) => (id === null ? null : Number(id))),
        tap((id) => {
          if (id !== null && Number.isInteger(id)) {
            if (!store.entityMap()[id]) {
              messagesStore.getMessagesData(id);
            }

            store.setCurrentDialogId(id);
          } else {
            store.setCurrentDialogId(null);
          }
        }),
      ),
    ),
  })),
  withHooks({
    onInit: (store) => {
      store.onDeleteWsContact();
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
      store.loadMessages();
    },
  }),
);
