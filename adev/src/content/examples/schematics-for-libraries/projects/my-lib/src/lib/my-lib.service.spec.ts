import {TestBed} from '@angular/core/testing';

import {MyLibService} from './my-lib.service';

describe('MyLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MyLibService = TestBed.inject(MyLibService);
    expect(service).toBeTruthy();
  });
});
