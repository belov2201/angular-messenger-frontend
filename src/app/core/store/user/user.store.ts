import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { UserService } from './user.service';
import { tapResponse } from '@ngrx/operators';
import { AlertsService } from '../../alerts';
import { Router } from '@angular/router';
import { AuthDto, EditUserAvatarDto, EditUserDto, RegisterDto, UserEntity } from './user.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiState, baseApiState } from '@app/shared/libs';

interface UserState extends BaseApiState {
  user: UserEntity | null;
  isUnauthorized: boolean;
}

const initialState: UserState = {
  ...baseApiState,
  user: null,
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

                  patchState(store, { isError: true });
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
                  patchState(store, { user, isLoaded: true, isUnauthorized: false });
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
      logout: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap(() => {
            return userService.logout().pipe(
              tapResponse({
                next: () => {
                  patchState(store, { ...initialState, isLoaded: true });
                  router.navigate(['/auth'], { replaceUrl: true });
                  alertService.showSuccessAlert('Вы вышли из учетной записи');
                },
                error: () => alertService.showErrorAlert('Ошибка выхода из учетной записи'),
                finalize: () => patchState(store, { isPendingAction: false }),
              }),
            );
          }),
        ),
      ),
      editUser: rxMethod<EditUserDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((editUserDto) => {
            return userService.editUserData(editUserDto).pipe(
              tapResponse({
                next: () => {
                  patchState(store, (state) => ({
                    user: state?.user ? { ...state.user, ...editUserDto } : null,
                  }));

                  alertService.showSuccessAlert('Информация о пользователе отредактирована');
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка редактирования информации о пользователе');
                },
                finalize: () => {
                  patchState(store, { isPendingAction: false });
                },
              }),
            );
          }),
        ),
      ),
      editAvatar: rxMethod<EditUserAvatarDto>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap((editUserAvatarDto) => {
            return userService.editUserAvatar(editUserAvatarDto).pipe(
              tapResponse({
                next: ({ fileName }) => {
                  patchState(store, (state) => ({
                    user: state?.user ? { ...state.user, avatar: fileName } : null,
                  }));

                  alertService.showSuccessAlert('Аватар успешно изменен');
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка изменения аватара');
                },
                finalize: () => {
                  patchState(store, { isPendingAction: false });
                },
              }),
            );
          }),
        ),
      ),
      deleteAvatar: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isPendingAction: true })),
          switchMap(() => {
            return userService.deleteUserAvatar().pipe(
              tapResponse({
                next: () => {
                  patchState(store, (state) => ({
                    user: state?.user ? { ...state.user, avatar: null } : null,
                  }));

                  alertService.showSuccessAlert('Аватар удален');
                },
                error: () => {
                  alertService.showErrorAlert('Ошибка удаления аватара');
                },
                finalize: () => {
                  patchState(store, { isPendingAction: false });
                },
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
