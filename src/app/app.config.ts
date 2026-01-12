import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { Preset } from '@app/core/theme';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors';
import { environment } from 'environments/environment';
import { AppConfig } from './core/config/app-config.token';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { withCredentialsInterceptor } from './core/interceptors';
import { DialogService } from 'primeng/dynamicdialog';
import { SocketIoConfig, provideSocketIo } from 'ngx-socket-io';

const wsConfig: SocketIoConfig = {
  url: environment.apiUrl,
  options: { autoConnect: false, withCredentials: true },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideSocketIo(wsConfig),
    providePrimeNG({
      theme: {
        preset: Preset,
      },
    }),
    { provide: AppConfig, useValue: environment },
    provideHttpClient(withInterceptors([apiInterceptor, withCredentialsInterceptor])),
    MessageService,
    ConfirmationService,
    DialogService,
  ],
};
