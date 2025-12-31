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

interface ContactsState {
  contacts: ContactEntity[];
  isPendingAction: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
}

const initialState: ContactsState = {
  contacts: [],
  isPendingAction: false,
  isLoading: false,
  isLoaded: false,
  isError: false,
};

export const ContactsStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    getCount: computed(() => store.contacts().length),
  })),
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
