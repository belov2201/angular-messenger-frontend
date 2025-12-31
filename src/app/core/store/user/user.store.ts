import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { UserService } from './user.service';
import { tapResponse } from '@ngrx/operators';
import { AlertsService } from '../../alerts';
import { Router } from '@angular/router';
import { AuthDto, RegisterDto, UserEntity } from './user.interface';
import { HttpErrorResponse } from '@angular/common/http';

interface UserState {
  user: UserEntity | null;
  isPendingAction: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  isUnauthorized: boolean;
}

const initialState: UserState = {
  user: null,
  isPendingAction: false,
  isLoading: false,
  isLoaded: false,
  isUnauthorized: false,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      userService = inject(UserService),
      alertService = inject(AlertsService),
      router = inject(Router),
    ) => ({
      getUserData: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() => {
            return userService.getUserData().pipe(
              tapResponse({
                next: (user) => {
                  patchState(store, { user });
                  router.navigate(['/'], { replaceUrl: true });
                },
                error: (err: HttpErrorResponse) => {
                  if (err.status === 401) {
                    patchState(store, { isUnauthorized: true });
                    return;
                  }

                  alertService.showErrorAlert('Ошибка авторизации');
                },
                finalize: () => {
                  patchState(store, { isLoaded: true, isLoading: false });
                },
              }),
            );
          }),
        ),
      ),
      auth: rxMethod<AuthDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((authDto) => {
            return userService.auth(authDto).pipe(
              tapResponse({
                next: (user) => {
                  patchState(store, { user });
                  router.navigate(['/'], { replaceUrl: true });
                },
                error: () => alertService.showErrorAlert('Ошибка авторизации'),
                finalize: () => patchState(store, { isPendingAction: false }),
              }),
            );
          }),
        ),
      ),
      register: rxMethod<RegisterDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((registerDto) => {
            return userService.register(registerDto).pipe(
              tapResponse({
                next: () => {
                  router.navigate(['auth'], { replaceUrl: true });
                  alertService.showSuccessAlert('Вы успешно зарегистрированы');
                },
                error: () => alertService.showErrorAlert('Ошибка регистрации'),
                finalize: () => patchState(store, { isPendingAction: false }),
              }),
            );
          }),
        ),
      ),
    }),
  ),
  withHooks({
    onInit: (store) => {
      store.getUserData();
    },
  }),
);
