import { computed, Signal } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

interface AppStatusState {
  loadings: Signal<boolean>[];
  errors: Signal<boolean>[];
  loaded: Signal<boolean>[];
}

const initialState: AppStatusState = {
  loadings: [],
  errors: [],
  loaded: [],
};

export const AppStatusStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isLoading: computed(() => store.loadings().some((e) => e())),
    isError: computed(() => store.errors().some((e) => e())),
    isLoadedInitData: computed(() => store.loaded().length > 1 && store.loaded().every((e) => e())),
  })),
  withMethods((store) => ({
    registerLoadingSignal(signal: Signal<boolean>) {
      patchState(store, (state) => ({
        loadings: [...state.loadings, signal],
      }));

      return () => {
        patchState(store, (state) => ({
          loadings: state.loadings.filter((e) => e !== signal),
        }));
      };
    },

    registerErrorSignal(signal: Signal<boolean>) {
      patchState(store, (state) => ({
        errors: [...state.errors, signal],
      }));

      return () => {
        patchState(store, (state) => ({
          errors: state.errors.filter((e) => e !== signal),
        }));
      };
    },

    registerLoadedSignal(signal: Signal<boolean>) {
      patchState(store, (state) => ({
        loaded: [...state.loaded, signal],
      }));

      return () => {
        patchState(store, (state) => ({
          loaded: state.loaded.filter((e) => e !== signal),
        }));
      };
    },
  })),
);
