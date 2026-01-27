import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { ContactsStore } from './contacts.store';
import { setupProviders } from 'testing/setup-providers';
import { ContactDto, LastMessageDto } from './contacts.interface';
import { participantsMock } from 'testing/mocks/participants/participants.mock';
import { userMock } from 'testing/mocks/user/user.mock';
import { TestBed } from '@angular/core/testing';
import { ContactsService } from './contacts.service';
import { throwError } from 'rxjs';

fdescribe('ContactsStore', () => {
  let store: InstanceType<typeof ContactsStore>;

  beforeEach(() => {
    store = setupProviders(ContactsStore);
  });

  it('should be created', () => {
    expect(store.isLoaded()).toBeTrue();
    expect(store.isPendingAction()).toBeFalse();
    expect(store.entities()).toEqual(contactsMock);
  });

  it('add contact', () => {
    const contactDto: ContactDto = {
      id: 10,
      noReadCount: 0,
      online: false,
      lastMessage: null,
      participants: [participantsMock[0], participantsMock[3]],
    };

    store.addContact(contactDto);
    expect(store.entities().length).toBe(contactsMock.length + 1);
    expect(store.entities()[store.entities().length - 1]).toEqual(contactDto);
  });

  it('update last message', () => {
    const message: LastMessageDto = {
      id: 10,
      audio: null,
      date: '2026-01-12T12:20:31.534Z',
      duration: 0,
      isRead: false,
      text: 'some message',
    };

    store.updateLastMessage(contactsMock[0].id, message);
    expect(store.entityMap()[contactsMock[0].id].lastMessage).toEqual(message);
  });

  it('delete last message', () => {
    const message: LastMessageDto = {
      id: 10,
      audio: null,
      date: '2026-01-12T12:20:31.534Z',
      duration: 0,
      isRead: false,
      text: 'some message',
    };

    store.updateLastMessage(contactsMock[0].id, message);
    expect(store.entityMap()[contactsMock[0].id].lastMessage).toEqual(message);
    store.deleteLastMessage(contactsMock[0].id, { deletedMessage: message, newMessage: null });
    expect(store.entityMap()[contactsMock[0].id].lastMessage).toBeNull();
  });

  it('update contact status', () => {
    const updatedUserId = contactsMock[0].participants.find((e) => e.id !== userMock.id)?.id;
    expect(store.entityMap()[contactsMock[0].id].online).toBeFalse();
    if (!Number.isInteger(updatedUserId)) throw Error();
    store.updateContactStatus(updatedUserId!, true);
    expect(store.entityMap()[contactsMock[0].id].online).toBeTrue();
    store.updateContactStatus(updatedUserId!, false);
    expect(store.entityMap()[contactsMock[0].id].online).toBeFalse();
  });

  it('update typing status', () => {
    const contactId = contactsMock[0].id;
    expect(store.entityMap()[contactId].isTyping).toBeFalsy();
    store.updateTypingStatus(contactId, true);
    expect(store.entityMap()[contactId].isTyping).toBeTrue();
    store.updateTypingStatus(contactId, false);
    expect(store.entityMap()[contactId].isTyping).toBeFalse();
  });

  it('update no read count', () => {
    const contactId = contactsMock[0].id;
    expect(store.entityMap()[contactId].noReadCount).toBe(0);
    store.updateNoReadCount(contactId, 'increment');
    store.updateNoReadCount(contactId, 'increment');
    expect(store.entityMap()[contactId].noReadCount).toBe(2);
    store.updateNoReadCount(contactId, 'decrement');
    expect(store.entityMap()[contactId].noReadCount).toBe(1);
  });

  it('clear typing', () => {
    const contactId = contactsMock[0].id;
    expect(store.entityMap()[contactId].isTyping).toBeFalsy();
    store.updateTypingStatus(contactId, true);
    expect(store.entityMap()[contactId].isTyping).toBeTrue();
    store.clearTyping(contactId);
    expect(store.entityMap()[contactId].isTyping).toBeFalse();
  });

  it('delete contact', () => {
    const contactsService = TestBed.inject(ContactsService);
    store.deleteContact({ id: contactsMock[0].id });
    expect(contactsService.delete).toHaveBeenCalled();
    expect(store.entities().length).toBe(contactsMock.length - 1);
  });

  it('get contacts data', () => {
    const contactsService = TestBed.inject(ContactsService);
    expect(contactsService.getAll).toHaveBeenCalled();
    expect(store.entities().length).toBe(contactsMock.length);
  });

  it('get contacts data error', () => {
    const contactsService = TestBed.inject(ContactsService) as jasmine.SpyObj<ContactsService>;
    contactsService.getAll.calls.reset();
    contactsService.getAll.and.returnValue(throwError(() => new Error()));
    const contactsStore = TestBed.inject(ContactsStore);
    contactsStore.getContactsData();
    expect(contactsService.getAll).toHaveBeenCalled();
    expect(contactsStore.isError()).toBeTrue();
  });

  it('delete contact error', () => {
    const contactsService = TestBed.inject(ContactsService) as jasmine.SpyObj<ContactsService>;
    contactsService.delete.and.returnValue(throwError(() => new Error()));
    const contactsStore = TestBed.inject(ContactsStore);
    contactsStore.deleteContact({ id: contactsMock[0].id });
    expect(contactsStore.entities().length).toBe(contactsMock.length);
    expect(contactsService.delete).toHaveBeenCalled();
  });
});
