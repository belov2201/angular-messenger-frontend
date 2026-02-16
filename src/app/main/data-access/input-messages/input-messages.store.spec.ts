import { setupProviders } from 'testing/setup-providers';
import { InputMessagesStateStore } from './input-messages.store';
import { messagesMock } from 'testing/mocks/messages/messages.mock';
import { mapToMessageView } from '../messages/messages.mapper';
import { userMock } from 'testing/mocks/user/user.mock';
import { signal } from '@angular/core';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { TestBed } from '@angular/core/testing';

describe('InputMessagesStateStore', () => {
  const testDialogId = 0;

  let store: InstanceType<typeof InputMessagesStateStore>;

  beforeEach(async () => {
    store = setupProviders(InputMessagesStateStore, [
      { provide: CurrentDialogIdService, useValue: { value: signal(testDialogId) } },
    ]);

    TestBed.tick();
  });

  it('should create', async () => {
    expect(store).toBeTruthy();
    expect(store.entityMap()[testDialogId]).toBeTruthy();
  });

  it('set edit state', async () => {
    const editMessage = mapToMessageView(messagesMock[0], userMock)!;
    store.setEditState(editMessage);
    expect(store.entityMap()[editMessage.contact.id]).toEqual({
      id: testDialogId,
      edit: { message: editMessage, value: editMessage.text },
      send: '',
    });
  });

  it('change edit state value', async () => {
    const editMessage = mapToMessageView(messagesMock[0], userMock)!;
    store.setEditState(editMessage);
    store.changeEditStateValue('some edit text');
    expect(store.currentState()?.edit?.value).toBe('some edit text');
  });

  it('change send state value', async () => {
    const editMessage = mapToMessageView(messagesMock[0], userMock)!;
    store.setEditState(editMessage);
    store.changeSendStateValue('some send text');
    expect(store.currentState()?.send).toBe('some send text');
  });

  it('get current state', async () => {
    expect(store.currentState()).toEqual(store.entityMap()[testDialogId]);
  });

  it('reset edit state', async () => {
    const editMessage = mapToMessageView(messagesMock[0], userMock)!;
    store.setEditState(editMessage);
    store.changeEditStateValue('some edit text');
    expect(store.currentState()?.edit?.value).toBe('some edit text');
    store.resetEditState();
    expect(store.currentState()?.edit).toBeNull();
  });
});
