export const registerRoutes = [
  {
    path: 'register',
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent),
  },
];
