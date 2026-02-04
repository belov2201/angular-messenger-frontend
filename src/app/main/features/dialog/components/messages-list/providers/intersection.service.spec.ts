import { setupProviders } from 'testing/setup-providers';
import { IntersectionService } from './intersection.service';
import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('IntersectionService', () => {
  let service: InstanceType<typeof IntersectionService>;
  let mockObserver: jasmine.SpyObj<IntersectionObserver>;
  let intersectionObserverCb: IntersectionObserverCallback;

  beforeEach(() => {
    mockObserver = jasmine.createSpyObj('IntersectionObserver', [
      'observe',
      'unobserve',
      'disconnect',
    ]);

    spyOn(window, 'IntersectionObserver').and.callFake(function (cb) {
      intersectionObserverCb = cb;
      return mockObserver;
    });

    service = setupProviders(IntersectionService, [
      IntersectionService,
      { provide: ElementRef, useValue: document.createElement('div') },
    ]);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('observe some item', () => {
    const el = document.createElement('div');
    const cb = jasmine.createSpy('intersecting callback');
    service.observe(el, cb);
    expect(mockObserver.observe).toHaveBeenCalledWith(el);
  });

  it('unobserve some item', () => {
    const el = document.createElement('div');
    service.unobserve(el);
    expect(mockObserver.unobserve).toHaveBeenCalledWith(el);
  });

  it('trigger user cb', () => {
    const el = document.createElement('div');
    const cb = jasmine.createSpy('intersecting callback');
    service.observe(el, cb);
    expect(mockObserver.observe).toHaveBeenCalledWith(el);

    const mockEntry = { target: el, isIntersecting: true } as unknown as IntersectionObserverEntry;
    intersectionObserverCb([mockEntry], mockObserver);

    expect(cb).toHaveBeenCalled();
  });

  it('disconnect when destroy', () => {
    TestBed.resetTestingModule();
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });
});
