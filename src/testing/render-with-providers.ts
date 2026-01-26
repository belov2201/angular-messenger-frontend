import { Type } from '@angular/core';
// import { UserService } from '@app/core/store/user/user.service';
import { render, RenderResult, RenderTemplateOptions } from '@testing-library/angular';
// import { ConfirmationService, MessageService } from 'primeng/api';
// import { createUserServiceMock } from './mocks/user/create-user-service.mock';
// import { createSocketMock } from './mocks/create-socket-mock';
// import { Socket } from 'ngx-socket-io';
// import { ContactsStore } from '@app/main/data-access/contacts';
// import { WsService } from '@app/main/providers/ws/ws.service';
// import { ContactsService } from '@app/main/data-access/contacts/contacts.service';
// import { createContactsServiceMock } from './mocks/contacts/create-contacts-service.mock';
// import { environment } from 'environments/environment';
// import { AppConfig } from '@app/core/config';
// import { InvitesStore } from '@app/main/data-access/invites';
// import { DialogService } from 'primeng/dynamicdialog';
import { TestWrapperComponent } from './test-wrapper/test-wrapper.component';
import { getSharedProviders } from './get-shared-providers';
// import { ConfirmModalService, ModalService } from '@app/core/providers';
// import { InvitesService } from '@app/main/data-access/invites/invites.service';
// import { createInvitesServiceMock } from './mocks/invites/create-invites-service.mock';

export const renderWithProviders = <T>(
  component: Type<T>,
  renderOptions?: RenderTemplateOptions<T>,
): Promise<RenderResult<unknown, unknown>> => {
  return render(TestWrapperComponent, {
    ...renderOptions,
    providers: [getSharedProviders(renderOptions?.providers ?? [])],
    inputs: {
      component: component,
      componentInputs: renderOptions?.inputs ?? {},
    },
  });
};
