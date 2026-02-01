import { EnvironmentProviders, Provider } from '@angular/core';
import { AppConfig } from '@app/core/config';
import { ConfirmModalService, ModalService } from '@app/core/providers';
import { UserService } from '@app/core/store/user/user.service';
import { ContactsStore } from '@app/main/data-access/contacts';
import { ContactsService } from '@app/main/data-access/contacts/contacts.service';
import { InvitesStore } from '@app/main/data-access/invites';
import { InvitesService } from '@app/main/data-access/invites/invites.service';
import { WsService } from '@app/main/providers/ws/ws.service';
import { environment } from 'environments/environment';
import { Socket } from 'ngx-socket-io';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { createUserServiceMock } from './mocks/user/create-user-service.mock';
import { createContactsServiceMock } from './mocks/contacts/create-contacts-service.mock';
import { createInvitesServiceMock } from './mocks/invites/create-invites-service.mock';
import { createMessagesServiceMock } from './mocks/messages/create-messages-service.mock';
import { createSocketMock } from './mocks/socket/create-socket-mock';
import { provideRouter } from '@angular/router';
import { AlertsService } from '@app/core/alerts';
import { MessagesService } from '@app/main/data-access/messages/messages.service';
import { MessagesStore } from '@app/main/data-access/messages';
import { DialogsStateStore } from '@app/main/data-access/dialogs-state';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { ScrollStateStore } from '@app/main/data-access/scroll';
import { InputMessagesStateStore } from '@app/main/data-access/input-messages';
import { DialogComponent } from '@app/main/features/dialog/dialog.component';
import { MainComponent } from '@app/main/main.component';

export const getSharedProviders = (
  extra: (Provider | EnvironmentProviders)[] = [],
): (Provider | EnvironmentProviders)[] => {
  return [
    { provide: AppConfig, useValue: environment },
    ConfirmationService,
    ConfirmModalService,
    MessageService,
    DialogService,
    ContactsStore,
    MessagesStore,
    DialogsStateStore,
    ScrollStateStore,
    InputMessagesStateStore,
    CurrentDialogIdService,
    InvitesStore,
    ModalService,
    WsService,
    AlertsService,
    provideRouter([
      {
        path: '',
        component: MainComponent,
        children: [{ path: 'dialog/:dialogId', component: DialogComponent }],
      },
    ]),
    { provide: UserService, useValue: createUserServiceMock() },
    { provide: ContactsService, useValue: createContactsServiceMock() },
    { provide: InvitesService, useValue: createInvitesServiceMock() },
    { provide: MessagesService, useValue: createMessagesServiceMock() },
    { provide: Socket, useValue: createSocketMock() },
    ...extra,
  ];
};
