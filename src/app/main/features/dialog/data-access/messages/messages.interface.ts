import { ParticipantDto } from '@app/core/store/user';
import { ContactDto } from '@app/main/data-access/contacts/contacts.interface';

export type MessageSenderDto = Omit<ParticipantDto, 'username'>;

export interface MessageDto {
  id: number;
  text: string;
  date: string;
  sender: MessageSenderDto;
  contact: Pick<ContactDto, 'id'>;
  isRead: boolean;
  audio: string | null;
  duration: number | null;
}

export type MessageEntity = MessageDto;

export interface Message extends MessageEntity {
  isSender: boolean;
  user: MessageSenderDto;
  groupDate: string;
  status?: 'sent' | 'loading' | 'error';
}

export interface CreateMessageDto {
  text: string;
  senderId: number;
  contactId: number;
  sender: MessageSenderDto;
}

export type SendMessageParam = Pick<CreateMessageDto, 'contactId' | 'text'>;

export type DeleteMessageDto = Pick<MessageDto, 'id'>;

export interface DeleteMessageResponseDto {
  prevMessage: MessageDto | null;
}

export interface UpdateMessageDto {
  id: number;
  text?: string;
  isRead?: boolean;
}
