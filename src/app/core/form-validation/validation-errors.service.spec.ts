import { TestBed } from '@angular/core/testing';

import { ValidationErrorsService } from './validation-errors.service';

describe('ValidationErrorsService', () => {
  let service: ValidationErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('with exist error message', () => {
    expect(service.getTextError('required', {})).toBe('Поле обязательно для заполнения');
  });

  it('with no exist error message', () => {
    expect(service.getTextError('some no exist field', {})).toBeNull();
  });
});
