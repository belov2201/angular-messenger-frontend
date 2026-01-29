import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const ContactsEvents = eventGroup({
  source: 'Contacts',
  events: {
    delete: type<{ id: number }>(),
  },
});
