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

export const messagesMock: MessageDto[] = createMessagesList(messagesMockChunk * 5);
