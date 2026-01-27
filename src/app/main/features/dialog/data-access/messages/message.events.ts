import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import { Message, MessageDto } from './messages.interface';

export const MessageEvents = eventGroup({
  source: 'Messages',
  events: {
    getMessagesData: type<{ id: number }>(),
    getMessagesDataSuccess: type<{ id: number; messages: Message[] }>(),
    getMessagesDataError: type<{ id: number }>(),
    getMessagesDataAdditionaly: type<{ id: number }>(),
    getMessagesDataAdditionalySuccess: type<{ id: number; messages: Message[] }>(),
    getMessagesDataAdditionalyError: type<{ id: number }>(),
    add: type<Message>(),
    delete: type<MessageDto>(),
    updateReadStatusMessage: type<Message>(),
    updateReadStatusMessageError: type<Message>(),
  },
});
