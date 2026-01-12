import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Socket } from 'ngx-socket-io';
import { tap } from 'rxjs';

@Injectable()
export class WsService {
  readonly socket = inject(Socket);

  readonly status = signal<'connected' | 'disconnected' | 'error'>('disconnected');

  constructor() {
    this.socket
      .fromEvent('connect')
      .pipe(
        tap(() => this.status.set('connected')),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.socket
      .fromEvent('error')
      .pipe(
        tap(() => this.status.set('error')),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.socket
      .fromEvent('disconnect')
      .pipe(
        tap((reason) =>
          this.status.set(reason === 'io client disconnect' ? 'disconnected' : 'error'),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
