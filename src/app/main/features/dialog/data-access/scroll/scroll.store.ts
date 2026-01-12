import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, switchMap, tap } from 'rxjs';
import { addEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { ActivatedRoute } from '@angular/router';

interface BaseScrollStateStore {
  currentDialogId: number | null;
}

interface ScrollState {
  id: number;
  isScrolled: boolean;
  isScrollAdd: boolean;
  isRestoreScroll: boolean;
  isScrollAdditionaly: boolean;
  scrollPosition: number;
  prevScrollHeight: number;
}

const createInitialState = (id: number): ScrollState => {
  return {
    id,
    isScrolled: false,
    isScrollAdd: false,
    isRestoreScroll: false,
    isScrollAdditionaly: false,
    scrollPosition: 0,
    prevScrollHeight: 0,
  };
};

export const ScrollStateStore = signalStore(
  withState<BaseScrollStateStore>(() => ({
    currentDialogId: null,
  })),
  withEntities<ScrollState>(),
  withComputed((store) => ({
    currentState: computed(() => {
      const id = store.currentDialogId();
      return id !== null ? store.entityMap()[id] : null;
    }),
  })),
  withMethods((store) => {
    return {
      setCurrentDialogId(value: number | null) {
        patchState(store, { currentDialogId: value });
      },
      setIsScrollAdditionaly(id: number, value: boolean) {
        patchState(store, updateEntity({ id, changes: { isScrollAdditionaly: value } }));
      },
      setIsScrolled(id: number) {
        patchState(store, updateEntity({ id, changes: { isScrolled: true } }));
      },
      setScrollAdd(id: number, value: boolean) {
        patchState(store, updateEntity({ id, changes: { isScrollAdd: value } }));
      },
      setScrollPosition(id: number, value: number) {
        patchState(store, updateEntity({ id, changes: { scrollPosition: value } }));
      },
      setPrevScrollHeight(value: number) {
        const currentState = store.currentState();

        if (currentState)
          patchState(
            store,
            updateEntity({ id: currentState.id, changes: { prevScrollHeight: value } }),
          );
      },
      setIsRestoreScroll(id: number, value: boolean) {
        patchState(store, updateEntity({ id, changes: { isRestoreScroll: value } }));
      },
      getById(id: number) {
        return store.entityMap()[id];
      },
    };
  }),
  withMethods((store, activateRoute = inject(ActivatedRoute)) => ({
    createState: rxMethod<void>(
      pipe(
        switchMap(() => activateRoute.paramMap),
        map((paramMap) => paramMap.get('dialogId')),
        map((id) => (id === null ? null : Number(id))),
        tap((id) => store.setCurrentDialogId(id)),
        tap((id) => {
          if (id === null) return;
          patchState(store, addEntity(createInitialState(id)));
        }),
      ),
    ),
  })),
  withHooks({
    onInit: (store) => {
      store.createState();
    },
  }),
);
