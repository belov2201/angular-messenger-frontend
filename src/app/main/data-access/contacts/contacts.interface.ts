import { UserDto } from '@app/core/store/user';

export type ParticipantDto = Omit<UserDto, 'inviteCode'>;

export interface LastMessageDto {
  id: number;
  text: string;
  date: string;
  isRead: boolean;
  audio: string | null;
  duration: number | null;
}

export interface ContactDto {
  id: number;
  participants: ParticipantDto[];
  noReadCount: number;
  lastMessage: LastMessageDto | null;
  online: boolean;
}

export type ContactEntity = ContactDto & { isTyping?: boolean };

export interface Contact extends ContactEntity {
  user: ParticipantDto;
}

export type DeleteContactDto = Pick<ContactDto, 'id'>;

export interface DeleteLastMessageParams {
  deletedMessage: LastMessageDto;
  newMessage: LastMessageDto | null;
}
