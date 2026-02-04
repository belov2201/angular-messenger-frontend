import { AlertsService } from './alerts.service';
import { setupProviders } from 'testing/setup-providers';

describe('AlertsService', () => {
  let service: InstanceType<typeof AlertsService>;

  beforeEach(() => {
    service = setupProviders(AlertsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
