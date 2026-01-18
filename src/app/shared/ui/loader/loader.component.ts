import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loader',
  imports: [ProgressSpinnerModule],
  template: '<p-progress-spinner strokeWidth="4" />',
  host: {
    class:
      'absolute left-0 top-0 w-full h-full flex justify-center items-center bg-gray-50/10 z-1000',
    'data-testid': 'loader',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {}
