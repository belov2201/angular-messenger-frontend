import { of } from 'rxjs';
import { ContactsService } from '@app/main/data-access/contacts/contacts.service';
import { contactsMock } from './contacts.mock';

export const createContactsServiceMock = () => {
  const contactsServiceSpy: jasmine.SpyObj<ContactsService> = jasmine.createSpyObj(
    'ContactsService',
    ['getAll'],
  );

  contactsServiceSpy.getAll.and.returnValue(of(contactsMock));

  return contactsServiceSpy;
};
