import { FieldErrorMessageComponent } from './field-error-message.component';
import { render, screen } from '@testing-library/angular';

describe('FieldErrorMessageComponent', () => {
  it('should create', async () => {
    const errorMessage = 'some error message';
    await render(FieldErrorMessageComponent, { inputs: { message: errorMessage } });
    expect(screen.getByText(errorMessage)).toBeTruthy();
  });
});
