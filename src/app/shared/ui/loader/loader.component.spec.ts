import { screen } from '@testing-library/angular';
import { LoaderComponent } from './loader.component';
import { renderWithProviders } from 'testing/render-with-providers';

describe('LoaderComponent', () => {
  it('should create', async () => {
    await renderWithProviders(LoaderComponent);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
