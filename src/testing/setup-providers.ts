import { TestBed } from '@angular/core/testing';
import { getSharedProviders } from './get-shared-providers';
import { EnvironmentProviders, Provider, Type } from '@angular/core';
import { provideRouter } from '@angular/router';

export const setupProviders = <T>(
  token: Type<T>,
  extra: (Provider | EnvironmentProviders)[] = [],
): T => {
  TestBed.configureTestingModule({
    providers: [
      getSharedProviders(),
      provideRouter([{ path: 'dialog/:dialogId', children: [] }]),
      ...extra,
    ],
  });

  return TestBed.inject(token);
};
