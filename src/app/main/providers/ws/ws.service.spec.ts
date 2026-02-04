import { WsService } from './ws.service';
import { setupProviders } from 'testing/setup-providers';

describe('WsService', () => {
  let service: WsService;

  beforeEach(() => {
    service = setupProviders(WsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
