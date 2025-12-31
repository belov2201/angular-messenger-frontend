import { ParticipantDto } from '@app/core/store/user';

export interface InviteDto {
  id: number;
  sender: ParticipantDto;
  recipient: ParticipantDto;
}

export type InviteEntity = InviteDto;
