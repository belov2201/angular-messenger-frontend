import { setupProviders } from 'testing/setup-providers';
import { DialogsStateStore } from './dialogs-state.store';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from '../messages/messages.service';
import { messagesMock, messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { Message } from '../messages';
import { mapToMessageView } from '../messages/messages.mapper';
import { userMock } from 'testing/mocks/user/user.mock';
import { CurrentDialogIdService } from '@app/main/providers/current-dialog-id';
import { signal, WritableSignal } from '@angular/core';
import { waitFor } from '@testing-library/angular';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { UserStore } from '@app/core/store/user';
import { ContactsStore } from '../contacts';

describe('DialogsStateStore', () => {
  let store: InstanceType<typeof DialogsStateStore>;
  let mockDialogIdSignal: WritableSignal<number | null>;

  beforeEach(async () => {
    mockDialogIdSignal = signal<number | null>(1);

    store = setupProviders(DialogsStateStore, [
      { provide: CurrentDialogIdService, useValue: { value: mockDialogIdSignal } },
    ]);

    TestBed.tick();
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('load messages change dialog id', async () => {
    const messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    expect(messagesService.getAll).toHaveBeenCalledOnceWith(1);
    await waitFor(() => expect(messagesService.getAll).toHaveBeenCalledOnceWith(1));
    const dialogState = store.entityMap()[1];
    expect(dialogState).toBeTruthy();
    expect(dialogState.messageIds.length).toBe(messagesMockChunk);
    mockDialogIdSignal.set(2);
    TestBed.tick();
    await waitFor(() => expect(messagesService.getAll).toHaveBeenCalledWith(2));
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

  it('get current contact', async () => {
    expect(store.currentContact()).toBe(contactsMock.find((e) => e.id === mockDialogIdSignal()));
    mockDialogIdSignal.set(null);
    TestBed.tick();
    expect(store.currentContact()).toBeUndefined();
  });

  it('get current participant', async () => {
    expect(store.currentParticipant()).toBe(
      store.currentContact()?.participants.find((e) => e.id !== userMock.id),
    );

    const userStore = TestBed.inject(UserStore);
    userStore.logout();
    TestBed.tick();
    expect(store.currentParticipant()).toBeUndefined();
  });

  it('get current typing contact', async () => {
    expect(store.currentTypingContact()).toBeUndefined();

    const contactsStore = TestBed.inject(ContactsStore);

    contactsStore.updateTypingStatus(1, true);
    TestBed.tick();
    expect(store.currentTypingContact()).toBe(store.currentParticipant()?.firstName);
  });
});
