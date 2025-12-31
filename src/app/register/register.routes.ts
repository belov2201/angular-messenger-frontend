import { Route } from '@angular/router';
import { publicGuard } from '@app/core/guards';

export const registerRoutes: Route[] = [
  {
    path: 'register',
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent),
    canActivate: [publicGuard],
  },
];
