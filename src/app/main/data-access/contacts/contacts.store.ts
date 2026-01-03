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
import { ContactEntity } from './contacts.interface';
import { ContactsService } from './contacts.service';
import { baseApiState, BaseApiState } from '@app/shared/libs';
import { UserStore } from '@app/core/store/user';
import { mapToContactView } from './contacts.mapper';

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
  withMethods((store, contactsService = inject(ContactsService)) => ({
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
  })),
  withHooks({
    onInit: (store) => {
      store.getContactsData();
    },
  }),
);
