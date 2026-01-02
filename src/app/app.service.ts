import { computed, inject, Injectable, signal } from '@angular/core';
import { UserStore } from './core/store/user';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  userStore = inject(UserStore);

  isLoadingUser = this.userStore.isLoading;
  isLoadedUser = this.userStore.isLoaded;
  isErrorUser = this.userStore.isError;

  isLoadingInitData = signal<boolean>(false);
  isLoadedInitData = signal<boolean>(false);
  isErrorInitData = signal<boolean>(false);

  isPendingAction = this.userStore.isPendingAction;

  showLoader = computed(() => {
    const isLoadingUser = this.userStore.isLoading();
    const isUnauthorized = this.userStore.isUnauthorized();
    const isUserError = this.userStore.isUnauthorized();

    const isLoadingInitData = this.isLoadingInitData();
    const isLoadedInitData = this.isLoadedInitData();
    const isErrorInitData = this.isErrorInitData();

    const isPendingAction = this.isPendingAction();

    return (
      isPendingAction ||
      ((isLoadingUser || isLoadingInitData || !isLoadedInitData) &&
        !isUnauthorized &&
        !isUserError &&
        !isErrorInitData)
    );
  });

  showError = computed(() => this.isErrorInitData() || this.isErrorUser());
}
