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
import { InvitesService } from './invites.service';
import {
  ApproveInviteDto,
  CreateInviteDto,
  DeleteInviteDto,
  InviteDto,
  InviteEntity,
} from './invites.interface';
import { baseApiState } from '@app/shared/libs';
import { AlertsService } from '@app/core/alerts';
import { ContactsStore } from '../contacts';
import { addEntities, addEntity, removeEntity, withEntities } from '@ngrx/signals/entities';
import { UserStore } from '@app/core/store/user';
import { WsService } from '@app/main/providers/ws/ws.service';
import { WsEvents } from '@app/main/providers/ws/ws-events';

export const InvitesStore = signalStore(
  withState(baseApiState),
  withEntities<InviteEntity>(),
  withComputed((store) => {
    const userStore = inject(UserStore);

    return {
      incomingInvitesCount: computed(() => {
        return (
          store.entities().filter((invite) => invite.recipient.id === userStore.user()?.id)
            .length || 0
        );
      }),
    };
  }),
  withMethods(
    (
      store,
      invitesService = inject(InvitesService),
      alertService = inject(AlertsService),
      contactsStore = inject(ContactsStore),
    ) => ({
      getInvitesData: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return invitesService.getAll().pipe(
              tapResponse({
                next: (invites) => patchState(store, addEntities(invites)),
                error: () => patchState(store, { isError: true }),
                finalize: () => patchState(store, { isLoaded: true, isLoading: false }),
              }),
            );
          }),
        ),
      ),
      sendInvite: rxMethod<CreateInviteDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((createInviteDto) => {
            return invitesService.create(createInviteDto).pipe(
              tapResponse({
                next: (invite) => {
                  alertService.showSuccessAlert('Запрос на добавление отправлен');
                  patchState(store, addEntity(invite));
                },
                error: () => alertService.showErrorAlert('Ошибка отправки запроса'),
                finalize: () => patchState(store, { isPendingAction: false }),
              }),
            );
          }),
        ),
      ),
      approveInvite: rxMethod<ApproveInviteDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((approveInviteDto) => {
            return invitesService.approve(approveInviteDto).pipe(
              tapResponse({
                next: (contact) => {
                  alertService.showSuccessAlert('Пользователь успешно добавлен');
                  patchState(store, removeEntity(approveInviteDto.id));
                  contactsStore.addContact(contact);
                },
                error: () => alertService.showErrorAlert('Ошибка подтверждения заявки'),
                finalize: () => patchState(store, { isPendingAction: false }),
              }),
            );
          }),
        ),
      ),
      declineInvite: rxMethod<DeleteInviteDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((deleteInviteDto) => {
            return invitesService.delete(deleteInviteDto).pipe(
              tapResponse({
                next: () => {
                  alertService.showSuccessAlert('Заявка отклонена');
                  patchState(store, removeEntity(deleteInviteDto.id));
                },
                error: () => alertService.showErrorAlert('Ошибка удаления заявки'),
                finalize: () => patchState(store, { isPendingAction: false }),
              }),
            );
          }),
        ),
      ),
    }),
  ),
  withMethods((store, wsService = inject(WsService), alertService = inject(AlertsService)) => ({
    addWsInvite: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<InviteDto>(WsEvents.addInvite)),
        tap((invite) => {
          alertService.showSuccessAlert('Получено новое приглашение на добавление в список друзей');
          patchState(store, addEntity(invite));
        }),
      ),
    ),
    deleteWsInvite: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<number>(WsEvents.deleteInvite)),
        tap((inviteId) => patchState(store, removeEntity(inviteId))),
      ),
    ),
  })),
  withHooks({
    onInit: (store) => {
      store.getInvitesData();
      store.addWsInvite();
      store.deleteWsInvite();
    },
  }),
);
