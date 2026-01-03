// разница составляет менее суток и одинаковые даты - вывести время сообщения
// разница составляет менее суток и различаются даты - вывести вчера
// разница составляет более суток, но менее 2 суток - вывести вчера
// разница составляет более 2 суток - вывести дату
// разница составляет более года - вывести полную дату, включая год

import { getFormatDate, getFormatTime } from '@app/shared/libs/get-format-date';

const msInDay = 3600 * 24 * 1000;

export const getContactCardTime = (messageDate: Date, nowDate = new Date()) => {
  const difference = +nowDate - +messageDate;

  if (difference <= msInDay && messageDate.getDate() === nowDate.getDate()) {
    return getFormatTime(messageDate.getHours(), messageDate.getMinutes());
  } else if (difference <= msInDay && messageDate.getDate() !== nowDate.getDate()) {
    return 'вчера';
  } else if (
    difference >= msInDay &&
    difference <= msInDay + (3600 * nowDate.getHours() + nowDate.getSeconds()) * 1000
  ) {
    return 'вчера';
  } else if (messageDate.getFullYear() !== nowDate.getFullYear()) {
    return getFormatDate([
      messageDate.getDate(),
      messageDate.getMonth() + 1,
      messageDate.getFullYear(),
    ]);
  }

  return getFormatDate([messageDate.getDate(), messageDate.getMonth() + 1]);
};
