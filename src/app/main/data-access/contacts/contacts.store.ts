import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { groupBy, mergeMap, noop, pipe, switchMap, tap, throttleTime, timer } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  ContactDto,
  ContactEntity,
  DeleteLastMessageParams,
  LastMessageDto,
} from './contacts.interface';
import { ContactsService } from './contacts.service';
import { DeleteInviteDto } from '../invites/invites.interface';
import { AlertsService } from '@app/core/alerts';
import {
  withEntities,
  addEntity,
  addEntities,
  removeEntity,
  updateEntity,
} from '@ngrx/signals/entities';
import { WsService } from '@app/main/providers/ws/ws.service';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { withApiState } from '@app/shared/libs';
import { ActivatedRoute, Router } from '@angular/router';
import { injectDispatch } from '@ngrx/signals/events';
import { ContactsEvents } from './contacts.events';
import { MessageDto } from '../messages/messages.interface';
import { alertMessages } from '@app/shared/constants/alert-messages';

export const ContactsStore = signalStore(
  withApiState(),
  withEntities<ContactEntity>(),
  withComputed((store) => {
    return {
      sortedEntities: computed(() => {
        return [...store.entities()].sort(
          (a, b) => +new Date(b.lastMessage?.date || 0) - +new Date(a.lastMessage?.date || 0),
        );
      }),
    };
  }),
  withMethods((store) => ({
    addContact: (contact: ContactDto) => {
      patchState(store, addEntity(contact));
    },
    updateLastMessage(contactId: number, message: LastMessageDto) {
      const updatedContact = store.entityMap()[contactId];
      if (!updatedContact) return;

      const currentMessage = updatedContact.lastMessage;

      if (!currentMessage || new Date(currentMessage?.date) <= new Date(message.date)) {
        patchState(
          store,
          updateEntity({ id: contactId, changes: { lastMessage: { ...message } } }),
        );
      }
    },
    deleteLastMessage(contactId: number, { deletedMessage, newMessage }: DeleteLastMessageParams) {
      const currentContact = store.entityMap()[contactId];
      if (currentContact.lastMessage?.id !== deletedMessage.id) return;

      patchState(store, updateEntity({ id: contactId, changes: { lastMessage: newMessage } }));
    },
    updateContactStatus(userId: number, value: boolean) {
      const updatedContact = store
        .entities()
        .find((e) => e.participants.some((e) => e.id === userId));

      if (!updatedContact) return;
      patchState(store, updateEntity({ id: updatedContact.id, changes: { online: value } }));
    },
    updateTypingStatus(contactId: number, value: boolean) {
      patchState(store, updateEntity({ id: contactId, changes: { isTyping: value } }));
    },
    updateNoReadCount(contactId: number, action: 'increment' | 'decrement') {
      patchState(
        store,
        updateEntity({
          id: contactId,
          changes: (state) => ({
            noReadCount:
              action === 'increment'
                ? state.noReadCount + 1
                : state.noReadCount - 1 > 0
                  ? state.noReadCount - 1
                  : 0,
          }),
        }),
      );
    },
    clearTyping(contactId: number) {
      patchState(store, updateEntity({ id: contactId, changes: { isTyping: false } }));
    },
  })),
  withMethods(
    (
      store,
      contactsService = inject(ContactsService),
      alertService = inject(AlertsService),
      router = inject(Router),
      activatedRoute = inject(ActivatedRoute),
      contactsActionsDispatch = injectDispatch(ContactsEvents),
    ) => ({
      getContactsData: rxMethod<void>(
        pipe(
          switchMap(() => {
            return contactsService.getAll().pipe(
              store._handleLoading(),
              tapResponse({
                next: (contacts) => patchState(store, addEntities(contacts)),
                error: noop,
              }),
            );
          }),
        ),
      ),
      deleteContact: rxMethod<DeleteInviteDto>(
        pipe(
          switchMap((deleteContactDto) => {
            return contactsService.delete(deleteContactDto).pipe(
              store._handlePendingAction(),
              tapResponse({
                next: () => {
                  alertService.showSuccessAlert(alertMessages.deleteContactSuccess);

                  const activeDialogId =
                    activatedRoute.firstChild?.snapshot.paramMap.get('dialogId');

                  if (
                    activeDialogId !== undefined &&
                    deleteContactDto.id === Number(activeDialogId)
                  ) {
                    router.navigate(['/'], { replaceUrl: true });
                  }

                  contactsActionsDispatch.delete({ id: deleteContactDto.id });
                  patchState(store, removeEntity(deleteContactDto.id));
                },
                error: () => alertService.showErrorAlert(alertMessages.deleteContactError),
              }),
            );
          }),
        ),
      ),
    }),
  ),
  withMethods((store, wsService = inject(WsService), alertService = inject(AlertsService)) => ({
    changeOnlineStatus: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<number>(WsEvents.online)),
        tap((userId) => store.updateContactStatus(userId, true)),
      ),
    ),
    changeOfflineStatus: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<number>(WsEvents.offline)),
        tap((userId) => store.updateContactStatus(userId, false)),
      ),
    ),
    addWsContact: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<ContactDto>(WsEvents.addContact)),
        tap((contact) => {
          alertService.showSuccessAlert(alertMessages.addContactSuccess);
          patchState(store, addEntity(contact));
        }),
      ),
    ),
    deleteWsContact: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<number>(WsEvents.deleteContact)),
        tap((id) => patchState(store, removeEntity(id))),
      ),
    ),
    updateWsLastMessage: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.addMessage)),
        tap((message) => {
          store.updateLastMessage(message.contact.id, message);
          store.updateNoReadCount(message.contact.id, 'increment');
          store.clearTyping(message.contact.id);
        }),
      ),
    ),
    editWsLastMessage: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.updateMessage)),
        tap((message) => store.updateLastMessage(message.contact.id, message)),
      ),
    ),
    editReadStatusWsLastMessage: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.updateReadStateMessage)),
        tap((message) => store.updateLastMessage(message.contact.id, message)),
      ),
    ),
    changeTypingStatus: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<{ contactId: number }>(WsEvents.typing)),
        groupBy(({ contactId }) => contactId),
        mergeMap((group$) =>
          group$.pipe(
            throttleTime(500),
            tap(({ contactId }) => store.updateTypingStatus(contactId, true)),
            switchMap(({ contactId }) =>
              timer(3000).pipe(tap(() => store.updateTypingStatus(contactId, false))),
            ),
          ),
        ),
      ),
    ),
    deleteWsMessage: rxMethod<void>(
      pipe(
        switchMap(() =>
          wsService.socket.fromEvent<{
            removedMessage: MessageDto;
            prevMessage: MessageDto | null;
          }>(WsEvents.deleteMessage),
        ),
        tap(({ prevMessage, removedMessage }) => {
          store.deleteLastMessage(removedMessage.contact.id, {
            deletedMessage: removedMessage,
            newMessage: prevMessage,
          });

          if (!removedMessage.isRead) {
            store.updateNoReadCount(removedMessage.contact.id, 'decrement');
          }
        }),
      ),
    ),
  })),
  withHooks({
    onInit: (store) => {
      store.getContactsData();
      store.changeOnlineStatus();
      store.changeOfflineStatus();
      store.addWsContact();
      store.deleteWsContact();
      store.updateWsLastMessage();
      store.editWsLastMessage();
      store.deleteWsMessage();
      store.editReadStatusWsLastMessage();
      store.changeTypingStatus();
    },
  }),
);
