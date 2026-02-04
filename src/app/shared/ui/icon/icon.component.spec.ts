import { render, screen } from '@testing-library/angular';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  it('should create', async () => {
    await render('<app-icon data-testid="done-all-icon">done_all</app-icon>', {
      imports: [IconComponent],
    });

    expect(screen.getByText('done_all')).toBeInTheDocument();
    expect(screen.getByTestId('done-all-icon')).toBeInTheDocument();
  });
});
