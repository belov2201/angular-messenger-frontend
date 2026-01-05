import { ParticipantDto } from '@app/core/store/user';

export interface InviteDto {
  id: number;
  sender: ParticipantDto;
  recipient: ParticipantDto;
}

export type InviteEntity = InviteDto;

export interface Invite extends InviteEntity {
  id: number;
  user: ParticipantDto;
  isSender: boolean;
}
