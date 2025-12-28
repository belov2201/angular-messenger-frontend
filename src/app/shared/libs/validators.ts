import { Validators } from '@angular/forms';

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
};
