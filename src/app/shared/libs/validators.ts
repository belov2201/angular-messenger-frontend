import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export const validators = {
  login: [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(16),
    Validators.pattern('^[a-zA-Z0-9_]+$'),
  ],
  password: [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(16),
    Validators.pattern(/^[a-zA-Z0-9_]+$/),
  ],
  firstName: [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[a-zA-Zа-яА-Я]*$/),
  ],
  lastName: [
    Validators.required,
    Validators.maxLength(50),
    Validators.pattern(/^[a-zA-Zа-яА-Я]*$/),
  ],
};

export const comparePasswordValidator = (control: AbstractControl): ValidationErrors | null => {
  return control.value !== control.parent?.get('password')?.value ? { repeatPassword: true } : null;
};
