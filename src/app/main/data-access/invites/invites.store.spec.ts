import { setupProviders } from 'testing/setup-providers';
import { InvitesStore } from './invites.store';
import { invitesMock } from 'testing/mocks/invites/invites.mock';
import { TestBed } from '@angular/core/testing';
import { InvitesService } from './invites.service';
import { ContactsStore } from '../contacts';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import { throwError } from 'rxjs';

describe('Invites store', () => {
  let store: InstanceType<typeof InvitesStore>;

  beforeEach(() => {
    store = setupProviders(InvitesStore);
  });

  it('should be created', () => {
    expect(store.isLoaded()).toBeTrue();
    expect(store.isPendingAction()).toBeFalse();
    expect(store.entities()).toEqual(invitesMock);
  });

  it('get invites data', () => {
    const invitesService = TestBed.inject(InvitesService);
    expect(store.isLoaded()).toBeTrue();
    expect(store.isPendingAction()).toBeFalse();
    expect(store.entities()).toEqual(invitesMock);
    expect(invitesService.getAll).toHaveBeenCalled();
  });

  it('send invite', () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    store.sendInvite({ inviteCode: 'fae3d417-82e7-4187-714c-f48912a0726e' });
    expect(invitesService.create).toHaveBeenCalled();
    expect(store.entities().length).toBe(invitesMock.length + 1);
  });

  it('approve invite', () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    store.approveInvite({ id: 0 });
    expect(invitesService.approve).toHaveBeenCalled();
    expect(store.entities().length).toBe(invitesMock.length - 1);

    const contactsStore = TestBed.inject(ContactsStore);
    expect(contactsStore.entities().length).toBe(contactsMock.length + 1);
  });

  it('decline invite', () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    store.declineInvite({ id: 0 });
    expect(invitesService.delete).toHaveBeenCalled();
    expect(store.entities().length).toBe(invitesMock.length - 1);
  });

  it('get invites data error', () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    invitesService.getAll.calls.reset();
    invitesService.getAll.and.returnValue(throwError(() => new Error()));
    const invitesStore = TestBed.inject(InvitesStore);
    invitesStore.getInvitesData();
    expect(invitesService.getAll).toHaveBeenCalled();
    expect(invitesStore.isError()).toBeTrue();
  });

  it('send invite error', () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    invitesService.create.and.returnValue(throwError(() => new Error()));
    store.sendInvite({ inviteCode: 'fae3d417-82e7-4187-714c-f48912a0726e' });
    expect(invitesService.create).toHaveBeenCalled();
    expect(store.entities().length).toBe(invitesMock.length);
  });

  it('approve invite error', () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    invitesService.approve.and.returnValue(throwError(() => new Error()));
    store.approveInvite({ id: 0 });
    expect(invitesService.approve).toHaveBeenCalled();
    expect(store.entities().length).toBe(invitesMock.length);
    const contactsStore = TestBed.inject(ContactsStore);
    expect(contactsStore.entities().length).toBe(contactsMock.length);
  });

  it('decline invite error', () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    invitesService.delete.and.returnValue(throwError(() => new Error()));
    store.declineInvite({ id: 0 });
    expect(invitesService.delete).toHaveBeenCalled();
    expect(store.entities().length).toBe(invitesMock.length);
  });
});
