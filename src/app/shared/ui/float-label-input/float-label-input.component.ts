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
  private readonly ngControl = inject(NgControl, { self: true });

  fieldId = input.required<string>();
  label = input.required<string>();
  inputType = input<'password' | 'text'>('text');

  protected readonly value = signal<string>('');
  protected readonly disabled = signal<boolean>(false);

  private onChange: ((value: string) => void) | null = null;
  private onTouched: (() => void) | null = null;

  constructor() {
    this.ngControl.valueAccessor = this;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  writeValue(value: string): void {
    this.value.set(value);
  }

  inputValue(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (this.onChange) this.onChange(input.value);
  }

  onBlur() {
    if (this.onTouched) this.onTouched();
    this.ngControl.control?.updateValueAndValidity();
  }
}
