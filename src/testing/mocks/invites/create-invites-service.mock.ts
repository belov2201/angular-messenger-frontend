import { of } from 'rxjs';
import { InvitesService } from '@app/main/data-access/invites/invites.service';
import { invitesMock } from './invites.mock';

export const createInvitesServiceMock = () => {
  const contactsServiceSpy: jasmine.SpyObj<InvitesService> = jasmine.createSpyObj(
    'InvitesService',
    ['getAll', 'approve', 'delete'],
  );

  contactsServiceSpy.getAll.and.returnValue(of(invitesMock));
  contactsServiceSpy.delete.and.returnValue(of(undefined));

  return contactsServiceSpy;
};
