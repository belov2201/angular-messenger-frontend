import { Route } from '@angular/router';

export const dialogRoutes: Route[] = [
  {
    path: 'dialog/:dialogId',
    loadComponent: () => import('./dialog.component').then((m) => m.DialogComponent),
  },
];
