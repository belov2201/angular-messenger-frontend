import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { UserService } from './user.service';
import { tapResponse } from '@ngrx/operators';
import { AlertsService } from '../../alerts';
import { Router } from '@angular/router';
import { RegisterDto } from './user.interface';

interface UserState {
  isPendingAction: boolean;
}

const initialState: UserState = {
  isPendingAction: false,
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
);
