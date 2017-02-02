/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PageManagerService } from './page-manager.service';

describe('PageManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PageManagerService]
    });
  });

  it('should ...', inject([PageManagerService], (service: PageManagerService) => {
    expect(service).toBeTruthy();
  }));
});
