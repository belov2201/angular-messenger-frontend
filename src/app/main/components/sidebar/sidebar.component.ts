import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserBarComponent } from '../user-bar/user-bar.component';
import { ContactsListComponent } from '../contacts-list/contacts-list.component';

@Component({
  selector: 'app-sidebar',
  imports: [UserBarComponent, ContactsListComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  host: {
    class:
      'h-full flex flex-col overflow-auto bg-surface-50 min-w-[250px] max-w-[320px] basis-3/10 border-r border-surface-300',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {}
