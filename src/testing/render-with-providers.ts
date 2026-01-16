import { Type } from '@angular/core';
import { UserService } from '@app/core/store/user/user.service';
import { render, RenderComponentOptions, RenderResult } from '@testing-library/angular';
import { MessageService } from 'primeng/api';
import { createUserServiceMock } from './mocks/user/create-user-service.mock';
import { createSocketMock } from './mocks/create-socket-mock';
import { Socket } from 'ngx-socket-io';
import { ContactsStore } from '@app/main/data-access/contacts';
import { WsService } from '@app/main/providers/ws/ws.service';
import { ContactsService } from '@app/main/data-access/contacts/contacts.service';
import { createContactsServiceMock } from './mocks/contacts/create-contacts-service.mock';
import { environment } from 'environments/environment';
import { AppConfig } from '@app/core/config';

export const renderWithProviders = <T>(
  component: Type<T>,
  renderOptions?: RenderComponentOptions<T>,
): Promise<RenderResult<T, T>> => {
  return render(component, {
    ...renderOptions,
    providers: [
      { provide: AppConfig, useValue: environment },
      MessageService,
      ContactsStore,
      WsService,
      { provide: UserService, useValue: createUserServiceMock() },
      { provide: ContactsService, useValue: createContactsServiceMock() },
      { provide: Socket, useValue: createSocketMock() },
      ...(renderOptions?.providers || []),
    ],
  });
};
