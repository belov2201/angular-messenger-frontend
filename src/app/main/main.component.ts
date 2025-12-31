import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContactsStore } from './data-access/contacts';
import { InvitesStore } from './data-access/invites';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  contactsStore = inject(ContactsStore);
  invitesStore = inject(InvitesStore);
}
