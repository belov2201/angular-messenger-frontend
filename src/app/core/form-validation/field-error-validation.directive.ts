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
  private readonly control = inject(NgControl);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly validationErrorsService = inject(ValidationErrorsService);

  ngOnInit(): void {
    this.control.statusChanges
      ?.pipe(
        tap(() => this.handleErrorView()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private handleErrorView() {
    this.viewContainerRef.clear();

    if (!this.control.touched) return;

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
