import { DestroyRef, Directive, inject, OnInit, ViewContainerRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { FieldErrorMessageComponent } from './field-error-message/field-error-message.component';
import { ValidationErrorsService } from './validation-errors.service';

@Directive({
  selector: '[appFieldErrorValidation], [formControlName], [formControl]',
})
export class FieldErrorValidationDirective implements OnInit {
  control = inject(NgControl);
  viewContainerRef = inject(ViewContainerRef);
  destroyRef = inject(DestroyRef);
  validationErrorsService = inject(ValidationErrorsService);

  ngOnInit(): void {
    this.control.statusChanges
      ?.pipe(
        tap(() => this.handleErrorView()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  handleErrorView() {
    if (!this.control.touched) return;

    this.viewContainerRef.clear();

    const errors = Object.keys(this.control.errors || {});
    if (errors.length === 0) return;

    const error = errors[errors.length - 1];

    const textError = this.validationErrorsService.getTextError(
      error,
      this.control.errors?.[error],
    );

    if (!textError) return;

    const component = this.viewContainerRef.createComponent(FieldErrorMessageComponent);
    component.setInput('message', textError);
  }
}
