import { ParticipantDto } from '@app/core/store/user';
import { ContactDto } from '@app/main/data-access/contacts/contacts.interface';

export const contactParticipants: ParticipantDto[] = [
  {
    id: 1,
    username: 'test1',
    firstName: 'NameFirst',
    lastName: 'lastNameFirst',
    avatar: null,
  },
  {
    id: 2,
    username: 'test2',
    firstName: 'NameSecond',
    lastName: 'lastNameSecond',
    avatar: null,
  },
  {
    id: 3,
    username: 'test3',
    firstName: 'NameThird',
    lastName: 'lastNameThird',
    avatar: null,
  },
  {
    id: 4,
    username: 'test4',
    firstName: 'NameFourth',
    lastName: 'lastNameFourth',
    avatar: null,
  },
];

export const contactsMock: ContactDto[] = [
  {
    id: 1,
    noReadCount: 0,
    online: false,
    lastMessage: null,
    participants: [contactParticipants[0], contactParticipants[1]],
  },
  {
    id: 2,
    noReadCount: 0,
    online: false,
    lastMessage: null,
    participants: [contactParticipants[0], contactParticipants[2]],
  },
  {
    id: 3,
    noReadCount: 0,
    online: false,
    lastMessage: null,
    participants: [contactParticipants[0], contactParticipants[3]],
  },
];
