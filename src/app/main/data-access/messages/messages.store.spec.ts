import { setupProviders } from 'testing/setup-providers';
import { MessagesStore } from './messages.store';
import { messagesMockChunk } from 'testing/mocks/messages/messages.mock';
import { TestBed } from '@angular/core/testing';
import { MessagesService } from './messages.service';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { SendMessageParam } from './messages.interface';
import { userMock } from 'testing/mocks/user/user.mock';
import { ContactsStore } from '../contacts';
import { throwError } from 'rxjs';

describe('MessagesStore', () => {
  let store: InstanceType<typeof MessagesStore>;

  beforeEach(() => {
    store = setupProviders(MessagesStore);
    store.getMessagesData(0);
  });

  it('should be created', () => {
    const messagesService = TestBed.inject(MessagesService);
    expect(store).toBeTruthy();
    expect(store.entities().length).toBe(messagesMockChunk);
    expect(messagesService.getAll).toHaveBeenCalled();
  });

  it('get messages additionally', () => {
    const messagesService = TestBed.inject(MessagesService);
    expect(store).toBeTruthy();
    expect(store.entities().length).toBe(messagesMockChunk);
    expect(messagesService.getAll).toHaveBeenCalled();
    store.getAdditionalMessagesData({ id: contactsMock[0].id, start: messagesMockChunk });
    expect(messagesService.getAll).toHaveBeenCalledWith(contactsMock[0].id, messagesMockChunk);
    store.getAdditionalMessagesData({ id: contactsMock[0].id, start: store.entities().length });
    expect(messagesService.getAll).toHaveBeenCalledWith(contactsMock[0].id, messagesMockChunk * 2);
    expect(messagesService.getAll).toHaveBeenCalledTimes(3);
  });

  it('send message', () => {
    const messagesService = TestBed.inject(MessagesService);
    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };

    store.sendMessage(createMessageDto);

    expect(messagesService.create).toHaveBeenCalledOnceWith({
      text: createMessageDto.text,
      contactId,
      sender: userMock,
      senderId: userMock.id,
    });

    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage?.text).toBe(
      createMessageDto.text,
    );
  });

  it('edit message', () => {
    const messagesService = TestBed.inject(MessagesService);
    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };
    store.sendMessage(createMessageDto);

    const lastMessage = store.entities()[store.entities().length - 1];
    const editedMessage = store.entityMap()[lastMessage.id];
    const editMessageText = 'some edit message';

    store.editMessage({
      message: editedMessage,
      text: editMessageText,
    });

    expect(messagesService.edit).toHaveBeenCalledOnceWith({
      id: editedMessage.id,
      text: editMessageText,
    });

    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage?.text).toBe(editMessageText);
  });

  it('delete message', () => {
    const messagesService = TestBed.inject(MessagesService);
    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };
    store.sendMessage(createMessageDto);

    const deletedMessage = store.entities()[store.entities().length - 1];

    expect(contactsStore.entityMap()[deletedMessage.contact.id].lastMessage?.id).toBe(
      deletedMessage.id,
    );

    store.deleteMessage(deletedMessage);
    expect(store.entityMap()[deletedMessage.id]).toBeUndefined();

    expect(messagesService.delete).toHaveBeenCalledOnceWith({
      id: deletedMessage.id,
    });

    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage).toBeNull();
  });

  it('update status message', () => {
    const messagesService = TestBed.inject(MessagesService);
    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };
    store.sendMessage(createMessageDto);

    const lastMessage = store.entities()[store.entities().length - 1];
    const editedMessage = store.entityMap()[lastMessage.id];

    store.updateStatusMessage(editedMessage);

    expect(messagesService.edit).toHaveBeenCalledOnceWith({
      id: editedMessage.id,
      isRead: true,
    });

    expect(store.entityMap()[editedMessage.id].isRead).toBeTrue();
    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage?.isRead).toBeTrue();
  });

  it('send message error', () => {
    const messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    messagesService.create.and.returnValue(throwError(() => new Error()));

    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };

    store.sendMessage(createMessageDto);

    expect(messagesService.create).toHaveBeenCalledOnceWith({
      text: createMessageDto.text,
      contactId,
      sender: userMock,
      senderId: userMock.id,
    });

    expect(store.entities()[store.entities().length - 1].status).toBe('error');

    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage?.text).not.toBe(
      createMessageDto.text,
    );
  });

  it('edit message error', () => {
    const messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    messagesService.edit.and.returnValue(throwError(() => new Error()));

    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };
    store.sendMessage(createMessageDto);

    const lastMessage = store.entities()[store.entities().length - 1];
    const editedMessage = store.entityMap()[lastMessage.id];
    const editMessageText = 'some edit message';

    store.editMessage({
      message: editedMessage,
      text: editMessageText,
    });

    expect(messagesService.edit).toHaveBeenCalledOnceWith({
      id: editedMessage.id,
      text: editMessageText,
    });

    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage?.text).toBe(
      'some create message',
    );
  });

  it('delete message error', () => {
    const messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    messagesService.delete.and.returnValue(throwError(() => new Error()));

    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };
    store.sendMessage(createMessageDto);

    const deletedMessage = store.entities()[store.entities().length - 1];

    expect(contactsStore.entityMap()[deletedMessage.contact.id].lastMessage?.id).toBe(
      deletedMessage.id,
    );

    store.deleteMessage(deletedMessage);
    expect(store.entityMap()[deletedMessage.id]).toEqual(deletedMessage);

    expect(messagesService.delete).toHaveBeenCalledOnceWith({
      id: deletedMessage.id,
    });

    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage?.text).toBe(
      deletedMessage.text,
    );
  });

  it('update status message error', () => {
    const messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;
    messagesService.edit.and.returnValue(throwError(() => new Error()));

    const contactsStore = TestBed.inject(ContactsStore);

    const contactId = contactsMock[0].id;
    const createMessageDto: SendMessageParam = { contactId, text: 'some create message' };
    store.sendMessage(createMessageDto);

    const lastMessage = store.entities()[store.entities().length - 1];
    const editedMessage = store.entityMap()[lastMessage.id];

    store.updateStatusMessage(editedMessage);

    expect(messagesService.edit).toHaveBeenCalledOnceWith({
      id: editedMessage.id,
      isRead: true,
    });

    expect(store.entityMap()[editedMessage.id].isRead).toBeFalse();
    expect(contactsStore.entityMap()[contactsMock[0].id].lastMessage?.isRead).toBeFalse();
  });
});
