import { Type } from '@angular/core';
import { UserService } from '@app/core/store/user/user.service';
import { render, RenderComponentOptions, RenderResult } from '@testing-library/angular';
import { MessageService } from 'primeng/api';
import { createUserServiceMock } from './mocks/create-user-service-mock';

export const renderWithProviders = <T>(
  component: Type<T>,
  renderOptions?: RenderComponentOptions<T>,
): Promise<RenderResult<T, T>> => {
  return render(component, {
    ...renderOptions,
    providers: [
      MessageService,
      { provide: UserService, useValue: createUserServiceMock() },
      // { provide: Socket, useValue: },
      ...(renderOptions?.providers || []),
    ],
  });
};
