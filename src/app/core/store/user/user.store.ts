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
import { withApiState } from '@app/shared/libs';
import { alertMessages } from '@app/shared/constants/alert-messages';

interface UserState {
  user: UserEntity | null;
  isUnauthorized: boolean;
}

const initialState: UserState = {
  user: null,
  isUnauthorized: false,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withApiState(),
  withMethods(
    (
      store,
      userService = inject(UserService),
      alertService = inject(AlertsService),
      router = inject(Router),
    ) => ({
      getUserData: rxMethod<void>(
        pipe(
          switchMap(() => {
            return userService.getUserData().pipe(
              store._handleLoading(),
              tap(() => patchState(store, { isError: false, isUnauthorized: false })),
              tapResponse({
                next: (user) => patchState(store, { user }),
                error: (err: HttpErrorResponse) => {
                  if (err.status === 401) {
                    patchState(store, { isError: false, isUnauthorized: true });
                    return;
                  }

                  patchState(store, { isError: true });
                  alertService.showErrorAlert(alertMessages.authError);
                },
              }),
            );
          }),
        ),
      ),
      auth: rxMethod<AuthDto>(
        pipe(
          switchMap((authDto) => {
            return userService.auth(authDto).pipe(
              store._handlePendingAction(),
              tapResponse({
                next: (user) => {
                  patchState(store, { user, isLoaded: true });
                  router.navigate(['/'], { replaceUrl: true });
                },
                error: () => alertService.showErrorAlert(alertMessages.authError),
              }),
            );
          }),
        ),
      ),
      register: rxMethod<RegisterDto>(
        pipe(
          switchMap((registerDto) => {
            return userService.register(registerDto).pipe(
              store._handlePendingAction(),
              tapResponse({
                next: () => {
                  router.navigate(['auth'], { replaceUrl: true });
                  alertService.showSuccessAlert(alertMessages.registerSuccess);
                },
                error: () => alertService.showErrorAlert(alertMessages.registerError),
              }),
            );
          }),
        ),
      ),
      logout: rxMethod<void>(
        pipe(
          switchMap(() => {
            return userService.logout().pipe(
              store._handlePendingAction(),
              tapResponse({
                next: () => {
                  patchState(store, { ...initialState, isLoaded: true, isUnauthorized: true });
                  router.navigate(['/auth'], { replaceUrl: true });
                  alertService.showSuccessAlert(alertMessages.logoutSuccess);
                },
                error: () => alertService.showErrorAlert(alertMessages.logoutError),
              }),
            );
          }),
        ),
      ),
      editUser: rxMethod<EditUserDto>(
        pipe(
          switchMap((editUserDto) => {
            return userService.editUserData(editUserDto).pipe(
              store._handlePendingAction(),
              tapResponse({
                next: () => {
                  patchState(store, (state) => ({
                    user: state?.user ? { ...state.user, ...editUserDto } : null,
                  }));

                  alertService.showSuccessAlert(alertMessages.editUserDataSuccess);
                },
                error: () => {
                  alertService.showErrorAlert(alertMessages.editUserDataError);
                },
              }),
            );
          }),
        ),
      ),
      editAvatar: rxMethod<EditUserAvatarDto>(
        pipe(
          switchMap((editUserAvatarDto) => {
            return userService.editUserAvatar(editUserAvatarDto).pipe(
              store._handlePendingAction(),
              tapResponse({
                next: ({ fileName }) => {
                  patchState(store, (state) => ({
                    user: state?.user ? { ...state.user, avatar: fileName } : null,
                  }));

                  alertService.showSuccessAlert(alertMessages.editUserAvatarSuccess);
                },
                error: () => {
                  alertService.showErrorAlert(alertMessages.editUserAvatarError);
                },
              }),
            );
          }),
        ),
      ),
      deleteAvatar: rxMethod<void>(
        pipe(
          switchMap(() => {
            return userService.deleteUserAvatar().pipe(
              store._handlePendingAction(),
              tapResponse({
                next: () => {
                  patchState(store, (state) => ({
                    user: state?.user ? { ...state.user, avatar: null } : null,
                  }));

                  alertService.showSuccessAlert(alertMessages.deleteUserAvatarSuccess);
                },
                error: () => {
                  alertService.showErrorAlert(alertMessages.deleteUserAvatarError);
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
