import { InviteDto } from '@app/main/data-access/invites/invites.interface';
import { participantsMock } from '../participants/participants.mock';

export const invitesMock: InviteDto[] = [
  {
    id: 0,
    sender: participantsMock[1],
    recipient: participantsMock[0],
  },
  {
    id: 1,
    sender: participantsMock[0],
    recipient: participantsMock[2],
  },
  {
    id: 2,
    sender: participantsMock[0],
    recipient: participantsMock[3],
  },
];
