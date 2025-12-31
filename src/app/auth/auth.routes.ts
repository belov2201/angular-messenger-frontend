import { Route } from '@angular/router';
import { publicGuard } from '@app/core/guards';

export const authRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
    canActivate: [publicGuard],
  },
];
