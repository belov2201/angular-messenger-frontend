import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import JasmineDOM from '@testing-library/jasmine-dom';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

beforeAll(() => {
  jasmine.addMatchers(JasmineDOM);
});

afterEach(() => {
  const popovers = document.querySelectorAll('.p-popover, .p-motion');
  popovers.forEach((el) => el.remove());
});
