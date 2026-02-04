import { ConfirmModalService } from './confirm-modal.service';
import { setupProviders } from 'testing/setup-providers';

describe('ConfirmModalService', () => {
  let service: InstanceType<typeof ConfirmModalService>;

  beforeEach(() => {
    service = setupProviders(ConfirmModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
