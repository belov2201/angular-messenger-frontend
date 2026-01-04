import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const sizes = {
  s: 0.75,
  m: 1,
  l: 1.5,
};

@Component({
  selector: 'app-icon',
  imports: [],
  template: `
    <span
      class="material-icons"
      [style]="{
        fontSize: sizeValue() + 'rem',
        width: sizeValue() + 'rem',
        height: sizeValue() + 'rem',
      }"
      style="color: var(--p-surface-500)"
    >
      <ng-content />
    </span>
  `,
  host: { class: 'flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  size = input<'s' | 'm' | 'l'>('s');

  sizeValue = computed(() => sizes[this.size()]);
}
