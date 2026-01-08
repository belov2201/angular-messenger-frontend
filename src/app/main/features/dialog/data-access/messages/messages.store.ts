import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { addEntities, withEntities } from '@ngrx/signals/entities';
import { Message } from './messages.interface';

export const MessagesStore = signalStore(
  withEntities<Message>(),
  withMethods((store) => {
    return {
      addMany: (messages: Message[]) => patchState(store, addEntities(messages)),
      getById: (id: number) => store.entityMap()[id],
    };
  }),
);
