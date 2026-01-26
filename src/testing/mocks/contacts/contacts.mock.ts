import { ContactDto } from '@app/main/data-access/contacts/contacts.interface';
import { participantsMock } from '../participants/participants.mock';

export const contactsMock: ContactDto[] = [
  {
    id: 0,
    noReadCount: 0,
    online: false,
    lastMessage: null,
    participants: [participantsMock[0], participantsMock[1]],
  },
  {
    id: 1,
    noReadCount: 0,
    online: false,
    lastMessage: null,
    participants: [participantsMock[0], participantsMock[2]],
  },
  {
    id: 2,
    noReadCount: 0,
    online: false,
    lastMessage: null,
    participants: [participantsMock[0], participantsMock[3]],
  },
];
