import { UserDto } from '@app/core/store/user';
import { Message, MessageEntity } from './messages.interface';
import { getMessageGroupDate } from './lib';

export const mapToMessageView = (
  messageEntity: MessageEntity,
  user: UserDto | null,
): Message | null => {
  if (!user) return null;

  const isSender = user.id === messageEntity.sender.id;

  return {
    ...messageEntity,
    groupDate: getMessageGroupDate(new Date(messageEntity.date)),
    user: isSender ? { ...user } : messageEntity.sender,
    isSender,
  };
};
