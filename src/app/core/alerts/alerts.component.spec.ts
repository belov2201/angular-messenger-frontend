import { render, screen } from '@testing-library/angular';
import { AlertsComponent } from './alerts.component';
import { TestBed } from '@angular/core/testing';
import { AlertsService } from './alerts.service';
import { waitFor } from '@testing-library/angular';
import { MessageService } from 'primeng/api';

describe('AlertsComponent', () => {
  beforeEach(async () => {
    await render(AlertsComponent, {
      providers: [AlertsService, MessageService],
    });
  });

  it('should create', async () => {
    const alertsService = TestBed.inject(AlertsService);
    alertsService.showSuccessAlert('Some success alert');
    await waitFor(() => expect(screen.getByText('Some success alert')).toBeInTheDocument());
  });
});
