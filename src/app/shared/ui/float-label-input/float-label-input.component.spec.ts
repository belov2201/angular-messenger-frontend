import { FloatLabelInputComponent } from './float-label-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';

describe('FloatLabelInputComponent', () => {
  it('should create', async () => {
    await render(
      `<app-float-label-input 
        [formControl]="control" 
        fieldId="firstName" 
        label="Имя">
      </app-float-label-input>`,
      {
        imports: [ReactiveFormsModule, FloatLabelInputComponent],
        componentProperties: {
          control: new FormControl(''), // Создаем пустой контрол для теста
        },
      },
    );

    expect(screen.getByLabelText('Имя')).toBeInTheDocument();
  });
});
