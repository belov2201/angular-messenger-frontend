import { Type } from '@angular/core';
import { render, RenderResult, RenderTemplateOptions } from '@testing-library/angular';
import { TestWrapperComponent } from './test-wrapper/test-wrapper.component';
import { getSharedProviders } from './get-shared-providers';
import { provideRouter } from '@angular/router';
import { routes } from '@app/app.routes';

export const renderWithProviders = <T>(
  component: Type<T>,
  renderOptions?: RenderTemplateOptions<T>,
): Promise<RenderResult<unknown, unknown>> => {
  return render(TestWrapperComponent, {
    ...renderOptions,
    providers: [getSharedProviders(renderOptions?.providers ?? []), provideRouter(routes)],
    inputs: {
      component: component,
      componentInputs: renderOptions?.inputs ?? {},
    },
  });
};
