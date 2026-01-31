import { TestBed } from '@angular/core/testing';
import { CurrentDialogIdService } from './current-dialog-id.service';

describe('CurrentDialogIdService', () => {
  let service: CurrentDialogIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentDialogIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
