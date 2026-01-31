import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserBarComponent } from '../user-bar/user-bar.component';
import { ContactsListComponent } from '../contacts-list/contacts-list.component';

@Component({
  selector: 'app-sidebar',
  imports: [UserBarComponent, ContactsListComponent],
  template: `
    <app-user-bar />
    <app-contacts-list />
  `,
  host: {
    class: 'h-full flex flex-col overflow-auto bg-surface-50 md:border-r border-surface-300',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {}
