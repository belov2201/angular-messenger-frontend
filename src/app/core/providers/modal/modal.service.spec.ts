import { ModalService } from './modal.service';
import { setupProviders } from 'testing/setup-providers';

describe('ModalService', () => {
  let service: InstanceType<typeof ModalService>;

  beforeEach(() => {
    service = setupProviders(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
