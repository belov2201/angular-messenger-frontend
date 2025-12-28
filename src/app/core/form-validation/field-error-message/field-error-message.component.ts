import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  imports: [],
  template: '<div class="error-field-message">{{ message() }}</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorMessageComponent {
  message = input.required<string>();
}
