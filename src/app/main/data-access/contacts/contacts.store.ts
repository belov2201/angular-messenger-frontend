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
import { ContactDto, ContactEntity, LastMessageDto } from './contacts.interface';
import { ContactsService } from './contacts.service';
import { baseApiState } from '@app/shared/libs';
import { DeleteInviteDto } from '../invites/invites.interface';
import { AlertsService } from '@app/core/alerts';
import {
  withEntities,
  addEntity,
  addEntities,
  removeEntity,
  updateEntity,
} from '@ngrx/signals/entities';

interface DeleteLastMessageParams {
  deletedMessage: LastMessageDto;
  newMessage: LastMessageDto | null;
}

export const ContactsStore = signalStore(
  withState(baseApiState),
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
  withMethods(
    (store, contactsService = inject(ContactsService), alertService = inject(AlertsService)) => ({
      addContact: (contact: ContactDto) => {
        patchState(store, addEntity(contact));
      },
      updateLastMessage(contactId: number, message: LastMessageDto) {
        const updatedContact = store.entityMap()[contactId];
        if (!updatedContact) return;

        const currentMessage = updatedContact.lastMessage;

        if (!currentMessage || new Date(currentMessage?.date) < new Date(message.date)) {
          patchState(
            store,
            updateEntity({ id: contactId, changes: { lastMessage: { ...message } } }),
          );
        }
      },
      deleteLastMessage(
        contactId: number,
        { deletedMessage, newMessage }: DeleteLastMessageParams,
      ) {
        const currentContact = store.entityMap()[contactId];
        if (currentContact.lastMessage?.id !== deletedMessage.id) return;

        patchState(store, updateEntity({ id: contactId, changes: { lastMessage: newMessage } }));
      },
      getContactsData: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return contactsService.getAll().pipe(
              tapResponse({
                next: (contacts) => patchState(store, addEntities(contacts)),
                error: () => patchState(store, { isError: true }),
                finalize: () => patchState(store, { isLoaded: true, isLoading: false }),
              }),
            );
          }),
        ),
      ),
      deleteContact: rxMethod<DeleteInviteDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((deleteContactDto) => {
            return contactsService.delete(deleteContactDto).pipe(
              tapResponse({
                next: () => {
                  alertService.showSuccessAlert('Контакт удален');
                  patchState(store, removeEntity(deleteContactDto.id));
                },
                error: () => alertService.showErrorAlert('Ошибка удаления контакта'),
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
      store.getContactsData();
    },
  }),
);
