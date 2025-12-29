import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AlertsComponent } from './core/alerts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, AlertsComponent],
  template: `
    <app-alerts />
    <router-outlet />
  `,
  host: { class: 'block h-full' },
})
export class AppComponent {}
