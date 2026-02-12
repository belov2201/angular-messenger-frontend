import { MessageDto } from '@app/main/data-access/messages/messages.interface';
import { contactsMock } from '../contacts/contacts.mock';
import { userMock } from '../user/user.mock';
import { participantsMock } from '../participants/participants.mock';

export const messagesMockChunk = 50;
const startDate = 1753966763275;

const createMessagesList = (count: number): MessageDto[] => {
  return [...Array(count)].map((_, i) => {
    return {
      id: i,
      text: `some test message ${i}`,
      date: new Date(startDate + i * 10800000).toUTCString(),
      audio: null,
      isRead: i % 3 === 0,
      duration: null,
      sender: i % 2 === 0 ? userMock : participantsMock[1],
      contact: { id: contactsMock[0].id },
    };
  });
};

export const createMessageMock = (messageId: number, contactId: number): MessageDto => {
  return {
    id: messageId,
    text: `some test message ${messageId}`,
    date: new Date().toUTCString(),
    audio: null,
    isRead: false,
    duration: null,
    sender: participantsMock[participantsMock.length - 1],
    contact: { id: contactId },
  };
};

export const messagesMock: MessageDto[] = createMessagesList(messagesMockChunk * 5);

const createMessagesListWithContactId = (count: number, contactId: number): MessageDto[] => {
  return [...Array(count)].map((_, i) => {
    return {
      id: i,
      text: `some test message ${i}`,
      date: new Date(startDate + i * 10800000).toUTCString(),
      audio: null,
      isRead: i % 3 === 0,
      duration: null,
      sender: i % 2 === 0 ? userMock : participantsMock[1],
      contact: { id: contactId },
    };
  });
};

export const e2eMessagesMock: Record<number, MessageDto[]> = contactsMock.reduce(
  (r: Record<number, MessageDto[]>, c) => {
    r[c.id] = createMessagesListWithContactId(messagesMockChunk * 5, c.id);
    return r;
  },
  {},
);

export const getE2EmessagesMock = (contactId: number, start: number) => {
  if (!e2eMessagesMock[contactId]) {
    e2eMessagesMock[contactId] = createMessagesListWithContactId(messagesMockChunk * 5, contactId);
  }

  return e2eMessagesMock[contactId].slice(
    start,
    start + (start === 100 ? messagesMockChunk - 20 : messagesMockChunk),
  );
};
