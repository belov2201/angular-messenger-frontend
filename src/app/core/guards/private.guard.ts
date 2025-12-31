import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../store/user';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

export const privateGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userStore = inject(UserStore);

  return toObservable(userStore.isLoaded).pipe(
    filter((isLoaded) => isLoaded),
    map(() => {
      const user = userStore.user();
      if (!user) return router.createUrlTree(['/auth']);
      return true;
    }),
  );
};
