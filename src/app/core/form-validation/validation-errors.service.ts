import { Injectable } from '@angular/core';

interface ValidationParams {
  requiredLength?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ValidationErrorsService {
  private messages: Record<string, (args: ValidationParams) => string> = {
    required: () => 'Поле обязательно для заполнения',
    minlength: ({ requiredLength }) =>
      `Введенное значение не может быть меньше ${requiredLength} символов`,
    maxlength: ({ requiredLength }) =>
      `Введенное значение не может быть больше ${requiredLength} символов`,
    pattern: () => 'Введенное значение содержит недопустимые символы',
    repeatPassword: () => 'Введенные пароли не совпадают',
    inviteCodeFormat: () => 'Неверный формат кода',
  };

  getTextError(errorKey: string, params: ValidationParams): string | null {
    const cb = this.messages[errorKey];
    if (!cb) return null;
    return cb(params);
  }
}
