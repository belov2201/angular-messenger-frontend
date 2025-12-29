import { InjectionToken } from '@angular/core';

export interface IAppConfig {
  readonly apiUrl: string;
  readonly production: boolean;
}

export const AppConfig = new InjectionToken<IAppConfig>('app.config');
