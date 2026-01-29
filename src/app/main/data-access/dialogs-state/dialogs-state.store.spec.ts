import { setupProviders } from 'testing/setup-providers';
import { DialogsStateStore } from './dialogs-state.store';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from '../messages/messages.service';
import { messagesMock, messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { Message } from '../messages';
import { mapToMessageView } from '../messages/messages.mapper';
import { userMock } from 'testing/mocks/user/user.mock';

describe('DialogsStateStore', () => {
  let harness: RouterTestingHarness;
  let store: InstanceType<typeof DialogsStateStore>;

  beforeEach(async () => {
    store = setupProviders(DialogsStateStore);
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dialog/1');
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('load messages change dialog id', async () => {
    const messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    expect(messagesService.getAll).toHaveBeenCalledOnceWith(1);
    const dialogState = store.entityMap()[1];
    expect(dialogState).toBeTruthy();
    expect(dialogState.messageIds.length).toBe(messagesMockChunk);
    await harness.navigateByUrl('/dialog/2');
    expect(messagesService.getAll).toHaveBeenCalledWith(2);
    expect(messagesService.getAll).toHaveBeenCalledTimes(2);
    const dialogState2 = store.entityMap()[2];
    expect(dialogState2).toBeTruthy();
    expect(dialogState2.messageIds.length).toBe(messagesMockChunk);
  });

  it('add message', async () => {
    const messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    expect(messagesService.getAll).toHaveBeenCalledOnceWith(1);
    const dialogState = store.entityMap()[1];
    expect(dialogState).toBeTruthy();
    expect(dialogState.messageIds.length).toBe(messagesMockChunk);

    const lastMockMessage = messagesMock[messagesMock.length - 1];
    const addedMessage: Message = mapToMessageView(
      {
        ...lastMockMessage,
        contact: { id: 1 },
        id: lastMockMessage.id + 1,
        text: 'some test message 250',
      },
      userMock,
    ) as Message;

    store.addMessage(addedMessage);
    expect(store.entityMap()[1].messageIds.length).toBe(messagesMockChunk + 1);
  });

  it('delete message', async () => {
    const lastMockMessage = messagesMock[messagesMock.length - 1];
    const addedMessage: Message = mapToMessageView(
      {
        ...lastMockMessage,
        contact: { id: 1 },
        id: lastMockMessage.id + 1,
        text: 'some test message 250',
      },
      userMock,
    ) as Message;

    store.addMessage(addedMessage);
    expect(store.entityMap()[1].messageIds.length).toBe(messagesMockChunk + 1);
    expect(store.entityMap()[1].messageIds).toContain(addedMessage.id);
    store.addToProcessUpdateReadStatusMessages(addedMessage);
    expect(store.entityMap()[1].processUpdateReadStatusMessages).toContain(addedMessage);
    store.deleteMessage(addedMessage);
    expect(store.entityMap()[1].messageIds).not.toContain(addedMessage.id);
    expect(store.entityMap()[1].processUpdateReadStatusMessages).not.toContain(addedMessage);
  });

  it('add to update read status messages', async () => {
    const lastMockMessage = messagesMock[messagesMock.length - 1];
    const addedMessage: Message = mapToMessageView(
      {
        ...lastMockMessage,
        contact: { id: 1 },
        id: lastMockMessage.id + 1,
        text: 'some test message 250',
      },
      userMock,
    ) as Message;

    store.addToUpdateReadStatusMessages(addedMessage);
    expect(store.entityMap()[1].updateReadStatusMessages).toContain(addedMessage);
  });

  it('delete from update read status messages', async () => {
    const lastMockMessage = messagesMock[messagesMock.length - 1];
    const addedMessage: Message = mapToMessageView(
      {
        ...lastMockMessage,
        contact: { id: 1 },
        id: lastMockMessage.id + 1,
        text: 'some test message 250',
      },
      userMock,
    ) as Message;

    store.addToUpdateReadStatusMessages(addedMessage);
    expect(store.entityMap()[1].updateReadStatusMessages).toContain(addedMessage);

    store.deleteFromUpdateReadStatusMessages(addedMessage);
    expect(store.entityMap()[1].updateReadStatusMessages).not.toContain(addedMessage);
  });

  it('add to process update read status messages', async () => {
    const lastMockMessage = messagesMock[messagesMock.length - 1];
    const addedMessage: Message = mapToMessageView(
      {
        ...lastMockMessage,
        contact: { id: 1 },
        id: lastMockMessage.id + 1,
        text: 'some test message 250',
      },
      userMock,
    ) as Message;

    store.addToProcessUpdateReadStatusMessages(addedMessage);
    expect(store.entityMap()[1].processUpdateReadStatusMessages).toContain(addedMessage);
  });

  it('delete from process update read status messages', async () => {
    const lastMockMessage = messagesMock[messagesMock.length - 1];
    const addedMessage: Message = mapToMessageView(
      {
        ...lastMockMessage,
        contact: { id: 1 },
        id: lastMockMessage.id + 1,
        text: 'some test message 250',
      },
      userMock,
    ) as Message;

    store.addToProcessUpdateReadStatusMessages(addedMessage);
    expect(store.entityMap()[1].processUpdateReadStatusMessages).toContain(addedMessage);

    store.deleteFromProcessUpdateReadStatusMessages(addedMessage);
    expect(store.entityMap()[1].processUpdateReadStatusMessages).not.toContain(addedMessage);
  });

  it('delete state', async () => {
    expect(store.entityMap()[1]).toBeTruthy();
    store.deleteState(1);
    expect(store.entityMap()[1]).toBeFalsy();
  });
});
