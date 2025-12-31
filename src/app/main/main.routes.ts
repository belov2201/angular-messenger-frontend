import { Route } from '@angular/router';
import { privateGuard } from '@app/core/guards';
import { ContactsStore } from './data-access/contacts';
import { InvitesStore } from './data-access/invites';

export const mainRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./main.component').then((m) => m.MainComponent),
    canActivate: [privateGuard],
    providers: [ContactsStore, InvitesStore],
  },
];
