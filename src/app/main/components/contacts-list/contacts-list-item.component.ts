import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Contact } from '../../data-access/contacts/contacts.interface';
import { AppConfig } from '@app/core/config';
import { DateToStrPipe } from '@app/main/pipes/date-to-str';
import { IconComponent } from '@app/shared/ui';
import { AvatarComponent } from '@app/shared/ui';

@Component({
  selector: 'app-contacts-list-item',
  imports: [DateToStrPipe, IconComponent, AvatarComponent],
  templateUrl: './contacts-list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsListItemComponent {
  appConfig = inject(AppConfig);
  contact = input.required<Contact>();
}
