import { Pipe, PipeTransform } from '@angular/core';
import { getContactCardTime } from './get-contact-card-time';

@Pipe({
  name: 'dateToStr',
})
export class DateToStrPipe implements PipeTransform {
  transform(value: string): string {
    return getContactCardTime(new Date(value));
  }
}
