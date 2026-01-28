import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { finalize, Observable, tap } from 'rxjs';

interface ApiState {
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  isPendingAction: boolean;
}

const initialState: ApiState = {
  isLoading: false,
  isLoaded: false,
  isError: false,
  isPendingAction: false,
};

export const withApiState = () => {
  return signalStoreFeature(
    withState(initialState),
    withMethods((store) => ({
      _handleLoading() {
        return function <T>(obs$: Observable<T>) {
          patchState(store, { isLoading: true, isError: false, isLoaded: false });
          return obs$.pipe(
            tap({
              error: () => patchState(store, { isError: true }),
            }),
            finalize(() => patchState(store, { isLoaded: true, isLoading: false })),
          );
        };
      },
      _handlePendingAction() {
        return function <T>(obs$: Observable<T>) {
          patchState(store, { isPendingAction: true });
          return obs$.pipe(
            finalize(() => {
              patchState(store, { isPendingAction: false });
            }),
          );
        };
      },
    })),
  );
};
