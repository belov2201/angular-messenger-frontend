export const mainRoutes = [
  {
    path: '',
    loadComponent: () => import('./main.component').then((m) => m.MainComponent),
  },
];
