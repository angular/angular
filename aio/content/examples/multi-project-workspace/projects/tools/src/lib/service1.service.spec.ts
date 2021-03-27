import { TestBed } from '@angular/core/testing';

import { Service1Service } from './service1.service';

describe('Service1Service', () => {
  let service: Service1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Service1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
