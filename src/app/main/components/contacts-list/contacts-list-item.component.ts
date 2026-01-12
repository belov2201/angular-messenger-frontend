import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ContactEntity } from '../../data-access/contacts/contacts.interface';
import { DateToStrPipe } from '@app/main/pipes/date-to-str';
import { IconComponent } from '@app/shared/ui';
import { AvatarComponent } from '@app/shared/ui';
import { UserStore } from '@app/core/store/user';
import { mapToContactView } from '@app/main/data-access/contacts/contacts.mapper';
import { Badge } from 'primeng/badge';

@Component({
  selector: 'app-contacts-list-item',
  imports: [DateToStrPipe, IconComponent, AvatarComponent, Badge],
  templateUrl: './contacts-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsListItemComponent {
  private readonly userStore = inject(UserStore);
  readonly contactEntity = input.required<ContactEntity>();

  protected readonly contact = computed(() =>
    mapToContactView(this.contactEntity(), this.userStore.user()),
  );
}
