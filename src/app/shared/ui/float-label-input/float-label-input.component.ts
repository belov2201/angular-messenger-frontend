import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-float-label-input',
  imports: [FloatLabelModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './float-label-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatLabelInputComponent implements ControlValueAccessor {
  fieldId = input.required<string>();
  label = input.required<string>();
  inputType = input<'password' | 'text'>('text');
  value = signal<string>('');
  disabled = signal<boolean>(false);
  ngControl = inject(NgControl, { self: true });

  onChange = signal<((value: string) => void) | null>(null);
  onTouched = signal<(() => void) | null>(null);

  constructor() {
    this.ngControl.valueAccessor = this;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange.set(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched.set(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  writeValue(value: string): void {
    this.value.set(value);
  }

  inputValue(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const onChange = this.onChange();
    if (onChange) onChange(input.value);
  }

  onBlur() {
    const onTouched = this.onTouched();
    if (onTouched) onTouched();
    this.ngControl.control?.updateValueAndValidity();
  }
}
