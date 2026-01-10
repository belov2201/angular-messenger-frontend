import { Directive, effect, ElementRef, inject, input, OnDestroy, output } from '@angular/core';
import { IntersectionService } from '../providers/intersection.service';

@Directive({
  selector: '[appVisibility]',
})
export class VisibilityDirective implements OnDestroy {
  private readonly intersectionService = inject(IntersectionService);
  private readonly elementRef = inject(ElementRef);

  readonly visible = output<boolean>();

  readonly isEnabledVisibility = input<boolean>(false);

  constructor() {
    effect(() => {
      const isEnabledVisibility = this.isEnabledVisibility();

      if (isEnabledVisibility) {
        this.intersectionService.observe(this.elementRef.nativeElement, (isIntersecting) =>
          this.visible.emit(isIntersecting),
        );
      } else {
        this.intersectionService.unobserve(this.elementRef.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.intersectionService.unobserve(this.elementRef.nativeElement);
  }
}
