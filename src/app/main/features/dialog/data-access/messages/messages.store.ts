import { patchState, signalStore, withMethods } from '@ngrx/signals';
import {
  addEntities,
  addEntity,
  removeEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Message } from './messages.interface';

export const MessagesStore = signalStore(
  withEntities<Message>(),
  withMethods((store) => {
    return {
      addMany: (messages: Message[]) => patchState(store, addEntities(messages)),
      addOne: (message: Message) => patchState(store, addEntity(message)),
      updateOne: (id: number, changes: Partial<Message>) =>
        patchState(store, updateEntity({ id, changes: { ...changes } })),
      deleteOne: (id: number) => patchState(store, removeEntity(id)),
      getById: (id: number) => store.entityMap()[id],
    };
  }),
);
