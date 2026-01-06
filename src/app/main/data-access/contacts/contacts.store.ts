import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { ContactDto, ContactEntity } from './contacts.interface';
import { ContactsService } from './contacts.service';
import { baseApiState } from '@app/shared/libs';
import { DeleteInviteDto } from '../invites/invites.interface';
import { AlertsService } from '@app/core/alerts';
import { withEntities, addEntity, addEntities, removeEntity } from '@ngrx/signals/entities';

export const ContactsStore = signalStore(
  withState(baseApiState),
  withEntities<ContactEntity>(),
  withMethods(
    (store, contactsService = inject(ContactsService), alertService = inject(AlertsService)) => ({
      addContact: (contact: ContactDto) => {
        patchState(store, addEntity(contact));
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
