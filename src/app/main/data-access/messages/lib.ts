// разница составляет менее суток и одинаковые даты ничего не выводить
// разница составляет менее суток и различаются даты - вывести вчера
// разница составляет более суток, но менее 2 суток - вывести вчера
// разница составляет более 2 суток - вывести дату
// разница составляет более года - вывести полную дату, включая год

import { UserDto } from '@app/core/store/user';
import { CreateMessageDto, Message, MessageEntity, SendMessageParam } from './messages.interface';
import { mapToMessageView } from './messages.mapper';

const msInDay = 3600 * 24 * 1000;

const months: Record<number, string> = {
  0: 'января',
  1: 'февраля',
  2: 'марта',
  3: 'апреля',
  4: 'мая',
  5: 'июня',
  6: 'июля',
  7: 'августа',
  8: 'сентября',
  9: 'октября',
  10: 'ноября',
  11: 'декабря',
};

export const getMessageGroupDate = (currentMessageDate: Date, nowDate = new Date()): string => {
  const difference = +nowDate - +currentMessageDate;

  if (difference <= msInDay && currentMessageDate.getDate() === nowDate.getDate()) {
    return 'Сегодня';
  } else if (difference <= msInDay && currentMessageDate.getDate() !== nowDate.getDate()) {
    return 'Вчера';
  } else if (
    difference >= msInDay &&
    difference <= msInDay + (3600 * nowDate.getHours() + nowDate.getSeconds()) * 1000
  ) {
    return 'Вчера';
  } else if (currentMessageDate.getFullYear() !== nowDate.getFullYear()) {
    return `${currentMessageDate.getDate()} ${months[currentMessageDate.getMonth()]} ${currentMessageDate.getFullYear()}`;
  } else {
    return `${currentMessageDate.getDate()} ${months[currentMessageDate.getMonth()]}`;
  }
};

export const getCreateMessageDto = (param: SendMessageParam, user: UserDto): CreateMessageDto => {
  return {
    contactId: param.contactId,
    text: param.text,
    sender: user,
    senderId: user.id,
  };
};

export const createOptimisticMessage = (
  createMessageDto: CreateMessageDto,
  user: UserDto,
): Message => {
  const messageEntity: MessageEntity = {
    audio: null,
    text: createMessageDto.text,
    duration: null,
    id: Date.now(),
    date: new Date().toUTCString(),
    isRead: false,
    sender: createMessageDto.sender,
    contact: { id: createMessageDto.contactId },
  };

  const createdMessage = mapToMessageView(messageEntity, user) as Message;
  createdMessage.status = 'loading';

  return createdMessage;
};
