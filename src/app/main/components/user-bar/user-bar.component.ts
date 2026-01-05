import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmModalService } from '@app/core/providers';
import { UserStore } from '@app/core/store/user';
import { AvatarComponent, IconComponent } from '@app/shared/ui';
import { MenuItem } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ModalService } from '@app/core/providers';
import { ContactsComponent } from './contacts/contacts.component';
import { ContactsStore } from '@app/main/data-access/contacts';
import { InvitesStore } from '@app/main/data-access/invites';

@Component({
  selector: 'app-user-bar',
  imports: [AvatarComponent, Badge, MenuModule, ButtonModule, IconComponent],
  templateUrl: './user-bar.component.html',
  styleUrl: './user-bar.component.css',
  host: {
    class: 'py-3 px-2 border-b border-surface-300',
  },
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserBarComponent {
  protected readonly userStore = inject(UserStore);
  protected readonly contactsStore = inject(ContactsStore);
  protected readonly invitesStore = inject(InvitesStore);

  private readonly confirmModalService = inject(ConfirmModalService);
  private readonly modalService = inject(ModalService);

  protected readonly menuItems: MenuItem[] = [
    {
      label: 'Профиль',
      command: () => this.openProfile(),
    },
    {
      label: 'Контакты',
      command: () => this.openContacts(),
    },
    {
      label: 'Выйти',
      command: () => this.openLogoutDialog(),
    },
  ];

  private openProfile() {
    this.modalService.open(EditProfileComponent);
  }

  private openContacts() {
    this.modalService.open(ContactsComponent, {
      data: {
        invitesStore: this.invitesStore,
        contactsStore: this.contactsStore,
      },
    });
  }

  private openLogoutDialog() {
    this.confirmModalService.open({
      message: 'Вы уверены, что хотите выйти из учетной записи?',
      accept: () => this.userStore.logout(),
    });
  }
}
