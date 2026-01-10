import { DestroyRef, ElementRef, inject, Injectable } from '@angular/core';

type IntersectingCallback = (isIntersecting: boolean) => void;

@Injectable()
export class IntersectionService {
  private readonly elementRef = inject(ElementRef);
  private readonly callbacks = new Map<Element, IntersectingCallback>();

  private readonly intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const cb = this.callbacks.get(entry.target);
        if (cb) cb(entry.isIntersecting);
      });
    },
    { root: this.elementRef.nativeElement, threshold: 0.3 },
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.intersectionObserver.disconnect();
    });
  }

  observe(element: Element, cb: IntersectingCallback) {
    this.callbacks.set(element, cb);
    this.intersectionObserver.observe(element);
  }

  unobserve(element: Element) {
    this.callbacks.delete(element);
    this.intersectionObserver.unobserve(element);
  }
}
