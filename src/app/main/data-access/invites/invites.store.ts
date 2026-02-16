import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { noop, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { InvitesService } from './invites.service';
import {
  ApproveInviteDto,
  CreateInviteDto,
  DeleteInviteDto,
  InviteDto,
  InviteEntity,
} from './invites.interface';
import { AlertsService } from '@app/core/alerts';
import { ContactsStore } from '../contacts';
import { addEntities, addEntity, removeEntity, withEntities } from '@ngrx/signals/entities';
import { UserStore } from '@app/core/store/user';
import { WsService } from '@app/main/providers/ws/ws.service';
import { WsEvents } from '@app/main/providers/ws/ws-events';
import { withApiState } from '@app/shared/libs';
import { alertMessages } from '@app/shared/constants/alert-messages';

export const InvitesStore = signalStore(
  withApiState(),
  withEntities<InviteEntity>(),
  withComputed((store, userStore = inject(UserStore)) => ({
    incomingInvitesCount: computed(() => {
      return store.entities().filter((invite) => invite.recipient.id === userStore.user()?.id)
        .length;
    }),
  })),
  withMethods(
    (
      store,
      invitesService = inject(InvitesService),
      alertService = inject(AlertsService),
      contactsStore = inject(ContactsStore),
    ) => {
      return {
        getInvitesData: rxMethod<void>(
          pipe(
            switchMap(() => {
              return invitesService.getAll().pipe(
                store._handleLoading(),
                tapResponse({
                  next: (invites) => patchState(store, addEntities(invites)),
                  error: noop,
                }),
              );
            }),
          ),
        ),
        sendInvite: rxMethod<CreateInviteDto>(
          pipe(
            switchMap((createInviteDto) => {
              return invitesService.create(createInviteDto).pipe(
                store._handlePendingAction(),
                tapResponse({
                  next: (invite) => {
                    alertService.showSuccessAlert(alertMessages.sendInviteSuccess);
                    patchState(store, addEntity(invite));
                  },
                  error: () => alertService.showErrorAlert(alertMessages.sendInviteError),
                }),
              );
            }),
          ),
        ),
        approveInvite: rxMethod<ApproveInviteDto>(
          pipe(
            switchMap((approveInviteDto) => {
              return invitesService.approve(approveInviteDto).pipe(
                store._handlePendingAction(),
                tapResponse({
                  next: (contact) => {
                    alertService.showSuccessAlert(alertMessages.approveInviteSuccess);
                    patchState(store, removeEntity(approveInviteDto.id));
                    contactsStore.addContact(contact);
                  },
                  error: () => alertService.showErrorAlert(alertMessages.approveInviteError),
                }),
              );
            }),
          ),
        ),
        declineInvite: rxMethod<DeleteInviteDto>(
          pipe(
            switchMap((deleteInviteDto) => {
              return invitesService.delete(deleteInviteDto).pipe(
                store._handlePendingAction(),
                tapResponse({
                  next: () => {
                    alertService.showSuccessAlert(alertMessages.declineInviteSuccess);
                    patchState(store, removeEntity(deleteInviteDto.id));
                  },
                  error: () => alertService.showErrorAlert(alertMessages.declineInviteError),
                }),
              );
            }),
          ),
        ),
      };
    },
  ),
  withMethods((store, wsService = inject(WsService), alertService = inject(AlertsService)) => ({
    addWsInvite: rxMethod<void>(
      pipe(
        switchMap(() => wsService.socket.fromEvent<InviteDto>(WsEvents.addInvite)),
        tap((invite) => {
          alertService.showSuccessAlert(alertMessages.addInvite);
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
