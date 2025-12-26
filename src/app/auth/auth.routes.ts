export const authRoutes = [
  {
    path: 'auth',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
  },
];
