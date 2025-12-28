import { Routes } from '@angular/router';
import { authRoutes } from '@app/auth';
import { registerRoutes } from './register';

export const routes: Routes = [...authRoutes, ...registerRoutes];
