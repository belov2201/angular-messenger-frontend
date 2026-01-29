import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loader',
  imports: [ProgressSpinnerModule],
  template: '<p-progress-spinner strokeWidth="4" />',
  host: {
    class: `absolute left-0 top-0 w-full h-full flex justify-center items-center bg-gray-50/10`,
    '[style.zIndex]': 'zIndex()',
    'data-testid': 'loader',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  zIndex = input<number>(10000);
}
