import { Routes } from '@angular/router';
import { authRoutes } from '@app/auth';
import { registerRoutes } from './register';
import { mainRoutes } from './main';

export const routes: Routes = [...authRoutes, ...registerRoutes, ...mainRoutes];
