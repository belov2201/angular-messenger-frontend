import { CurrentDialogIdService } from './current-dialog-id.service';
import { setupProviders } from 'testing/setup-providers';

describe('CurrentDialogIdService', () => {
  let service: CurrentDialogIdService;

  beforeEach(() => {
    service = setupProviders(CurrentDialogIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
