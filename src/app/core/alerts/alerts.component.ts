import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-alerts',
  imports: [ToastModule],
  templateUrl: './alerts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsComponent {}
