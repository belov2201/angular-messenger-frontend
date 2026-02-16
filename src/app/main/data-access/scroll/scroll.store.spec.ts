import { setupProviders } from 'testing/setup-providers';
import { ScrollStateStore } from './scroll.store';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('ScrollStateStore', () => {
  const testDialogId = 1;
  let mockDialogIdSignal: WritableSignal<number | null>;

  let store: InstanceType<typeof ScrollStateStore>;

  beforeEach(async () => {
    mockDialogIdSignal = signal<number | null>(testDialogId);

    store = setupProviders(ScrollStateStore, [
      { provide: CurrentDialogIdService, useValue: { value: mockDialogIdSignal } },
    ]);

    TestBed.tick();
  });

  it('should create', async () => {
    expect(store).toBeTruthy();
    expect(store.entityMap()[testDialogId]).toBeTruthy();
  });

  it('set is scroll additionaly', async () => {
    store.setIsScrollAdditionaly(testDialogId, true);
    expect(store.entityMap()[testDialogId].isScrollAdditionaly).toBeTrue();
    store.setIsScrollAdditionaly(testDialogId, false);
    expect(store.entityMap()[testDialogId].isScrollAdditionaly).toBeFalse();
  });

  it('set is scrolled', async () => {
    store.setIsScrolled(testDialogId);
    expect(store.entityMap()[testDialogId].isScrolled).toBeTrue();
  });

  it('set scroll add', async () => {
    store.setScrollAdd(testDialogId, true);
    expect(store.entityMap()[testDialogId].isScrollAdd).toBeTrue();
    store.setScrollAdd(testDialogId, false);
    expect(store.entityMap()[testDialogId].isScrollAdd).toBeFalse();
  });

  it('set scroll position', async () => {
    store.setScrollPosition(testDialogId, 150);
    expect(store.entityMap()[testDialogId].scrollPosition).toBe(150);
    store.setScrollPosition(testDialogId, 700);
    expect(store.entityMap()[testDialogId].scrollPosition).toBe(700);
  });

  it('set prev scroll height', async () => {
    store.setScrollPosition(testDialogId, 700);
    expect(store.entityMap()[testDialogId].scrollPosition).toBe(700);
    store.setScrollPosition(testDialogId, 1700);
    expect(store.entityMap()[testDialogId].scrollPosition).toBe(1700);
  });

  it('set is restore scroll', async () => {
    store.setIsRestoreScroll(testDialogId, true);
    expect(store.entityMap()[testDialogId].isRestoreScroll).toBeTrue();
    store.setIsRestoreScroll(testDialogId, false);
    expect(store.entityMap()[testDialogId].isRestoreScroll).toBeFalse();
  });

  it('set is view last', async () => {
    store.setIsViewLast(true);
    expect(store.entityMap()[testDialogId].isViewLastMessage).toBeTrue();
    store.setIsViewLast(false);
    expect(store.entityMap()[testDialogId].isViewLastMessage).toBeFalse();
  });

  it('set is view last with current null', async () => {
    mockDialogIdSignal.set(null);
    TestBed.tick();
    store.setIsViewLast(true);
    expect(store.entityMap()[testDialogId].isViewLastMessage).toBeFalse();
  });

  it('get current item', async () => {
    store.setIsViewLast(true);
    expect(store.currentState()).toEqual(store.entityMap()[testDialogId]);
  });
});
