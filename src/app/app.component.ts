import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AlertsComponent } from './core/alerts';
import { LoaderComponent } from './shared/ui';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, AlertsComponent, LoaderComponent],
  template: `
    <app-alerts />

    @if (showLoader()) {
      <app-loader />
    }

    @if (!showError()) {
      <router-outlet />
    } @else {
      <div class="h-full flex justify-center items-center">
        Ошибка загрузки данных, перезапустите приложение
      </div>
    }
  `,
  host: { class: 'block h-full' },
})
export class AppComponent {
  private readonly appService = inject(AppService);

  protected readonly showLoader = this.appService.showLoader;
  protected readonly showError = this.appService.showError;
}
