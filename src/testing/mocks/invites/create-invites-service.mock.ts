import { of } from 'rxjs';
import { InvitesService } from '@app/main/data-access/invites/invites.service';
import { invitesMock } from './invites.mock';
import { InviteDto } from '@app/main/data-access/invites/invites.interface';
import { ContactDto } from '@app/main/data-access/contacts/contacts.interface';
import { contactsMock } from '../contacts/contacts.mock';

export const createInvitesServiceMock = () => {
  const contactsServiceSpy: jasmine.SpyObj<InvitesService> = jasmine.createSpyObj(
    'InvitesService',
    ['getAll', 'approve', 'delete', 'create'],
  );

  contactsServiceSpy.getAll.and.returnValue(of(invitesMock));
  contactsServiceSpy.delete.and.returnValue(of(undefined));

  const createInviteResponse: InviteDto = {
    ...invitesMock[invitesMock.length - 1],
    id: invitesMock[invitesMock.length - 1].id + 1,
  };

  contactsServiceSpy.create.and.returnValue(of(createInviteResponse));

  const approveInviteResponse: ContactDto = {
    ...contactsMock[contactsMock.length - 1],
    id: contactsMock[contactsMock.length - 1].id + 1,
  };

  contactsServiceSpy.approve.and.returnValue(of(approveInviteResponse));

  return contactsServiceSpy;
};
