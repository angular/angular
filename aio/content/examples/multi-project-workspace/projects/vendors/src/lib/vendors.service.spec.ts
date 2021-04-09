import { TestBed } from '@angular/core/testing';

import { VendorsService } from './vendors.service';

describe('VendorsService', () => {
  let service: VendorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
