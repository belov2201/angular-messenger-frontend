import { reflectComponentType, Type } from '@angular/core';
import { UserService } from '@app/core/store/user/user.service';
import { render, RenderResult, RenderTemplateOptions } from '@testing-library/angular';
import { ConfirmationService, MessageService } from 'primeng/api';
import { createUserServiceMock } from './mocks/user/create-user-service.mock';
import { createSocketMock } from './mocks/create-socket-mock';
import { Socket } from 'ngx-socket-io';
import { ContactsStore } from '@app/main/data-access/contacts';
import { WsService } from '@app/main/providers/ws/ws.service';
import { ContactsService } from '@app/main/data-access/contacts/contacts.service';
import { createContactsServiceMock } from './mocks/contacts/create-contacts-service.mock';
import { environment } from 'environments/environment';
import { AppConfig } from '@app/core/config';
import { InvitesStore } from '@app/main/data-access/invites';
import { DialogService } from 'primeng/dynamicdialog';
import { TestWrapperComponent } from './test-wrapper/test-wrapper.component';
import { ConfirmModalService } from '@app/core/providers';

export const renderWithProviders = <T>(
  component: Type<T>,
  renderOptions?: RenderTemplateOptions<T>,
): Promise<RenderResult<T, T>> => {
  const selector = reflectComponentType(component)?.selector;

  return render(`<app-test-wrapper><${selector}></${selector}></app-test-wrapper>`, {
    ...renderOptions,
    providers: [
      { provide: AppConfig, useValue: environment },
      MessageService,
      ConfirmationService,
      ConfirmModalService,
      DialogService,
      ContactsStore,
      InvitesStore,
      WsService,
      { provide: UserService, useValue: createUserServiceMock() },
      { provide: ContactsService, useValue: createContactsServiceMock() },
      { provide: Socket, useValue: createSocketMock() },
      ...(renderOptions?.providers || []),
    ],
    imports: [TestWrapperComponent, component],
  });
};
