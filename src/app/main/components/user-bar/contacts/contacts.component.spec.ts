import { screen } from '@testing-library/angular';
import { ContactsComponent } from './contacts.component';
import { renderWithProviders } from 'testing/render-with-providers';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { inject } from '@angular/core';
import { InvitesStore } from '@app/main/data-access/invites';
import { ContactsStore } from '@app/main/data-access/contacts';
import { contactsMock } from 'testing/mocks/contacts/contacts.mock';
import userEvent from '@testing-library/user-event';
import { modalMessages } from '@app/shared/constants/modal-messages';
import { TestBed } from '@angular/core/testing';
import { ContactsService } from '@app/main/data-access/contacts/contacts.service';
import { alertMessages } from '@app/shared/constants/alert-messages';
import { of, throwError } from 'rxjs';
import { InvitesService } from '@app/main/data-access/invites/invites.service';
import { invitesMock } from 'testing/mocks/invites/invites.mock';

describe('ContactsComponent', () => {
  beforeEach(async () => {
    await renderWithProviders(ContactsComponent, {
      providers: [
        {
          provide: DynamicDialogConfig,
          useFactory: () => {
            const invitesStore = inject(InvitesStore);
            const contactsStore = inject(ContactsStore);

            const config = new DynamicDialogConfig();
            config.data = { invitesStore, contactsStore };
            return config;
          },
        },
      ],
    });
  });

  it('should create', () => {
    expect(screen.getByText('Контакты')).toBeInTheDocument();
    expect(screen.getByText('Приглашения в список контактов')).toBeInTheDocument();
    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length);
  });

  it('delete contact success', async () => {
    const contactsService = TestBed.inject(ContactsService);
    const deleteButtons = screen.getAllByTestId('delete-contact-btn');
    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText(modalMessages.deleteContact)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }));
    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText(modalMessages.deleteContact)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length - 1);
    expect(contactsService.delete).toHaveBeenCalledTimes(1);
    expect(screen.getByText(alertMessages.deleteContactSuccess)).toBeInTheDocument();
  });

  it('delete contact error', async () => {
    const contactsService = TestBed.inject(ContactsService) as jasmine.SpyObj<ContactsService>;
    contactsService.delete.and.returnValue(throwError(() => new Error()));
    const deleteButtons = screen.getAllByTestId('delete-contact-btn');
    await userEvent.click(deleteButtons[0]);
    expect(screen.getByText(modalMessages.deleteContact)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    expect(contactsService.delete).toHaveBeenCalledTimes(1);
    expect(screen.getByText(alertMessages.deleteContactError)).toBeInTheDocument();
    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
  });

  it('approve invite success', async () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;

    invitesService.approve.and.returnValue(of({ ...contactsMock[0], id: contactsMock.length }));
    const declineButtons = screen.getAllByTestId('decline-invite-btn');
    const approveButtons = screen.getAllByTestId('approve-invite-btn');
    expect(declineButtons.length).toBe(1);
    expect(approveButtons.length).toBe(1);

    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length);

    await userEvent.click(approveButtons[0]);
    expect(screen.getByText(modalMessages.approveInvite)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }));

    await userEvent.click(approveButtons[0]);
    expect(screen.getByText(modalMessages.approveInvite)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    expect(screen.getByText(alertMessages.approveInviteSuccess)).toBeInTheDocument();
    expect(screen.queryAllByTestId('decline-invite-btn').length).toBe(0);
    expect(screen.queryAllByTestId('approve-invite-btn').length).toBe(0);
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length - 1);
    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length + 1);
    expect(invitesService.approve).toHaveBeenCalledTimes(1);
  });

  it('approve invite error', async () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;
    invitesService.approve.and.returnValue(throwError(() => new Error()));
    const approveButtons = screen.getAllByTestId('approve-invite-btn');
    await userEvent.click(approveButtons[0]);
    expect(screen.getByText(modalMessages.approveInvite)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    expect(screen.getByText(alertMessages.approveInviteError)).toBeInTheDocument();
    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length);
    expect(invitesService.approve).toHaveBeenCalledTimes(1);
  });

  it('decline invite success', async () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;

    const declineButtons = screen.getAllByTestId('decline-invite-btn');
    expect(declineButtons.length).toBe(1);

    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length);

    await userEvent.click(declineButtons[0]);
    expect(screen.getByText(modalMessages.declineInvite)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }));

    await userEvent.click(declineButtons[0]);
    expect(screen.getByText(modalMessages.declineInvite)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    expect(screen.getByText(alertMessages.declineInviteSuccess)).toBeInTheDocument();
    expect(screen.queryAllByTestId('decline-invite-btn').length).toBe(0);
    expect(screen.queryAllByTestId('approve-invite-btn').length).toBe(0);
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length - 1);
    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
    expect(invitesService.delete).toHaveBeenCalledTimes(1);
  });

  it('decline invite error', async () => {
    const invitesService = TestBed.inject(InvitesService) as jasmine.SpyObj<InvitesService>;

    invitesService.delete.and.returnValue(throwError(() => new Error()));
    const declineButtons = screen.getAllByTestId('decline-invite-btn');
    expect(declineButtons.length).toBe(1);

    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length);

    await userEvent.click(declineButtons[0]);
    expect(screen.getByText(modalMessages.declineInvite)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));
    expect(screen.getByText(alertMessages.declineInviteError)).toBeInTheDocument();
    expect(screen.getAllByTestId('invite-card').length).toBe(invitesMock.length);
    expect(screen.getAllByTestId('contact-card').length).toBe(contactsMock.length);
    expect(invitesService.delete).toHaveBeenCalledTimes(1);
  });
});
