import { Route } from '@angular/router';
import { privateGuard } from '@app/core/guards';

export const mainRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./main.component').then((m) => m.MainComponent),
    canActivate: [privateGuard],
  },
];
