import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals';
import {
  addEntities,
  addEntity,
  removeEntity,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Message, MessageDto } from './messages.interface';
import { WsService } from '@app/main/providers/ws/ws.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { inject } from '@angular/core';

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
  withMethods((store, wsService = inject(WsService)) => ({
    updateReadStateWs: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<MessageDto>(WsEvents.updateReadStateMessage)),
        tap((messageDto) => store.updateOne(messageDto.id, messageDto)),
      ),
    ),
  })),
  withHooks({
    onInit: (store) => {
      store.updateReadStateWs();
    },
  }),
);
