import { computed, inject, Injectable, signal } from '@angular/core';
import { UserStore } from './core/store/user';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly userStore = inject(UserStore);

  isLoadingInitData = signal<boolean>(false);
  isLoadedInitData = signal<boolean>(false);
  isErrorInitData = signal<boolean>(false);

  readonly showLoader = computed(() => {
    const isLoadingUser = this.userStore.isLoading();
    const isUnauthorized = this.userStore.isUnauthorized();
    const isUserError = this.userStore.isError();

    const isLoadingInitData = this.isLoadingInitData();
    const isLoadedInitData = this.isLoadedInitData();
    const isErrorInitData = this.isErrorInitData();

    const isPendingAction = this.userStore.isPendingAction();

    return (
      isPendingAction ||
      ((isLoadingUser || isLoadingInitData || !isLoadedInitData) &&
        !isUnauthorized &&
        !isUserError &&
        !isErrorInitData)
    );
  });

  readonly showError = computed(() => this.isErrorInitData() || this.userStore.isError());
}
