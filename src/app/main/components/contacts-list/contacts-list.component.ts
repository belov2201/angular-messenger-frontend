import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContactsStore } from '../../data-access/contacts';
import { RouterModule } from '@angular/router';
import { ContactsListItemComponent } from './contacts-list-item.component';

@Component({
  selector: 'app-contacts-list',
  imports: [ContactsListItemComponent, RouterModule],
  templateUrl: './contacts-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsListComponent {
  protected readonly contactsStore = inject(ContactsStore);
}
