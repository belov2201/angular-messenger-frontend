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
import { ContactDto, ContactEntity } from './contacts.interface';
import { ContactsService } from './contacts.service';
import { baseApiState, BaseApiState } from '@app/shared/libs';
import { UserStore } from '@app/core/store/user';
import { mapToContactView } from './contacts.mapper';
import { DeleteInviteDto } from '../invites/invites.interface';
import { AlertsService } from '@app/core/alerts';

interface ContactsState extends BaseApiState {
  contacts: ContactEntity[];
}

const initialState: ContactsState = {
  ...baseApiState,
  contacts: [],
};

export const ContactsStore = signalStore(
  withState(initialState),
  withComputed((store) => {
    const userStore = inject(UserStore);

    return {
      getCount: computed(() => store.contacts().length),
      displayContacts: computed(() => {
        return mapToContactView(store.contacts(), userStore.user());
      }),
    };
  }),
  withMethods(
    (store, contactsService = inject(ContactsService), alertService = inject(AlertsService)) => ({
      addContact: (contact: ContactDto) => {
        patchState(store, (state) => ({
          contacts: [...state.contacts, contact],
        }));
      },
      getContactsData: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return contactsService.getAll().pipe(
              tapResponse({
                next: (contacts) => patchState(store, { contacts }),
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
                  patchState(store, (state) => ({
                    contacts: state.contacts.filter((e) => e.id !== deleteContactDto.id),
                  }));
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
