import { TestBed } from '@angular/core/testing';
import { getSharedProviders } from './get-shared-providers';
import { Provider, Type } from '@angular/core';

export const setupProviders = <T>(token: Type<T>, extra: Provider[] = []): T => {
  TestBed.configureTestingModule({
    providers: [getSharedProviders(), ...extra],
  });

  return TestBed.inject(token);
};
