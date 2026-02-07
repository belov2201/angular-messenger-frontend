import { of } from 'rxjs';
import { messagesMock, messagesMockChunk } from './messages.mock';
import { MessagesService } from '@app/main/data-access/messages/messages.service';
import { participantsMock } from '../participants/participants.mock';

let counter = 0;

export const createMessagesServiceMock = () => {
  const messagesServiceSpy: jasmine.SpyObj<MessagesService> = jasmine.createSpyObj(
    'MessagesService',
    ['getAll', 'create', 'edit', 'delete'],
  );

  messagesServiceSpy.getAll.and.callFake((contactId, start) => {
    return of(messagesMock.slice(start, (start || 0) + messagesMockChunk));
  });

  messagesServiceSpy.create.and.callFake((createMessageDto) => {
    counter++;

    return of({
      id: messagesMock[messagesMock.length - 1].id + counter,
      text: createMessageDto.text,
      date: new Date().toUTCString(),
      audio: null,
      isRead: false,
      duration: null,
      sender: participantsMock[0],
      contact: { id: createMessageDto.contactId },
    });
  });

  messagesServiceSpy.edit.and.returnValue(of(undefined));
  messagesServiceSpy.delete.and.returnValue(of({ prevMessage: null }));

  return messagesServiceSpy;
};
