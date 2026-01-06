import { Route } from '@angular/router';

export const dialogRoutes: Route[] = [
  {
    path: 'dialog/:id',
    loadComponent: () => import('./dialog.component').then((m) => m.DialogComponent),
  },
];
