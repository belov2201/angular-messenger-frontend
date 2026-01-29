import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';
import { addEntity, EntityChanges, updateEntity, withEntities } from '@ngrx/signals/entities';
import { Message } from '../messages/messages.interface';
import { DialogsStateStore } from '../dialogs-state/dialogs-state.store';

interface InputMessageState {
  id: number;
  send: string;
  edit: {
    message: Message;
    value: string;
  } | null;
}

const createInitialState = (id: number): InputMessageState => {
  return {
    id,
    send: '',
    edit: null,
  };
};

export const InputMessagesStateStore = signalStore(
  withEntities<InputMessageState>(),
  withComputed((store, dialogsStateStore = inject(DialogsStateStore)) => ({
    currentState: computed(() => {
      const id = dialogsStateStore.currentDialogId();
      return id !== null ? store.entityMap()[id] : null;
    }),
  })),
  withMethods((store) => {
    const updateCurrent = (changes: EntityChanges<NoInfer<InputMessageState>>) => {
      const currentState = store.currentState();
      if (!currentState) return;
      patchState(store, updateEntity({ id: currentState.id, changes }));
    };

    return {
      createState: rxMethod<number | null>(
        pipe(
          tap((id) => {
            if (id === null) return;
            patchState(store, addEntity(createInitialState(id)));
          }),
        ),
      ),
      setEditState(message: Message) {
        updateCurrent({ edit: { message, value: message.text } });
      },
      changeEditStateValue(text: string) {
        updateCurrent((state) => ({
          edit: state.edit ? { ...state.edit, value: text } : null,
        }));
      },
      changeSendStateValue(text: string) {
        updateCurrent({ send: text });
      },
      resetEditState() {
        updateCurrent({ edit: null });
      },
    };
  }),
  withHooks({
    onInit: (store, dialogsStateStore = inject(DialogsStateStore)) => {
      store.createState(dialogsStateStore.currentDialogId);
    },
  }),
);
