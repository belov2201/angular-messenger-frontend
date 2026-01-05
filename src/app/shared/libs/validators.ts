import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const validators = {
  username: [
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
  inviteCode: [Validators.required, inviteCode()],
};

function inviteCode(): ValidatorFn {
  const patternChecker = Validators.pattern(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );

  return (control: AbstractControl): ValidationErrors | null => {
    const result = patternChecker(control);

    if (result && result['pattern']) {
      return {
        inviteCodeFormat: true,
      };
    }

    return null;
  };
}

export const comparePasswordValidator = (control: AbstractControl): ValidationErrors | null => {
  return control.value !== control.parent?.get('password')?.value ? { repeatPassword: true } : null;
};
