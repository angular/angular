import { TestBed } from '@angular/core/testing';

import { Service2Service } from './service2.service';

describe('Service2Service', () => {
  let service: Service2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Service2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
