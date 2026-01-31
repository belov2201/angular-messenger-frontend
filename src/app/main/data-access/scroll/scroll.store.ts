import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, map, pipe, switchMap, tap } from 'rxjs';
import { addEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { Events } from '@ngrx/signals/events';
import { MessagesEvents } from '../messages/messages.events';
import { injectCurrentDialogId } from '@app/main/providers/current-dialog-id';

interface ScrollState {
  id: number;
  isScrolled: boolean;
  isScrollAdd: boolean;
  isRestoreScroll: boolean;
  isScrollAdditionaly: boolean;
  scrollPosition: number;
  prevScrollHeight: number;
  isViewLastMessage: boolean;
}

const createInitialState = (id: number): ScrollState => {
  return {
    id,
    isScrolled: false,
    isScrollAdd: false,
    isRestoreScroll: false,
    isScrollAdditionaly: false,
    scrollPosition: 0,
    prevScrollHeight: 0,
    isViewLastMessage: false,
  };
};

export const ScrollStateStore = signalStore(
  withEntities<ScrollState>(),
  withComputed((store, currentDialogId = injectCurrentDialogId()) => ({
    currentState: computed(() => {
      const id = currentDialogId();
      return id !== null ? store.entityMap()[id] : null;
    }),
  })),
  withMethods((store, currentDialogId = injectCurrentDialogId()) => {
    return {
      setIsScrollAdditionaly(id: number, value: boolean) {
        patchState(store, updateEntity({ id, changes: { isScrollAdditionaly: value } }));
      },
      setIsScrolled(id: number) {
        patchState(store, updateEntity({ id, changes: { isScrolled: true } }));
      },
      setScrollAdd(id: number, value: boolean) {
        patchState(store, updateEntity({ id, changes: { isScrollAdd: value } }));
      },
      setScrollPosition(id: number, value: number) {
        patchState(store, updateEntity({ id, changes: { scrollPosition: value } }));
      },
      setPrevScrollHeight(value: number) {
        const currentState = store.currentState();

        if (currentState)
          patchState(
            store,
            updateEntity({ id: currentState.id, changes: { prevScrollHeight: value } }),
          );
      },
      setIsRestoreScroll(id: number, value: boolean) {
        patchState(store, updateEntity({ id, changes: { isRestoreScroll: value } }));
      },
      setIsViewLast(value: boolean) {
        if (!Number.isInteger(currentDialogId())) return;

        patchState(
          store,
          updateEntity({
            id: currentDialogId()!,
            changes: { isViewLastMessage: value },
          }),
        );
      },
      getById(id: number) {
        return store.entityMap()[id];
      },
    };
  }),
  withMethods((store, events = inject(Events)) => ({
    createState: rxMethod<number | null>(
      pipe(
        map((id) => (id === null ? null : Number(id))),
        tap((id) => {
          if (id === null) return;
          patchState(store, addEntity(createInitialState(id)));
        }),
      ),
    ),
    onGetMessagesAdditionaly: rxMethod<void>(
      pipe(
        switchMap(() =>
          events
            .on(MessagesEvents.getMessagesDataAdditionalySuccess)
            .pipe(tap((action) => store.setIsScrollAdditionaly(action.payload.id, true))),
        ),
      ),
    ),
    onAddMessage: rxMethod<void>(
      pipe(
        switchMap(() =>
          events.on(MessagesEvents.add).pipe(
            map((action) => action.payload),
            filter(
              (addedMessage) =>
                addedMessage.contact.id === store.currentState()?.id &&
                !!store.currentState()?.isViewLastMessage,
            ),
            tap((addedMessage) => store.setScrollAdd(addedMessage.contact.id, true)),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit: (store, currentDialogId = injectCurrentDialogId()) => {
      store.createState(currentDialogId);
      store.onGetMessagesAdditionaly();
      store.onAddMessage();
    },
  }),
);
