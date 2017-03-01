import { TestBed, inject } from '@angular/core/testing';
import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NavigationService]
    });
  });

  it('should ...', inject([NavigationService], (service: NavigationService) => {
    expect(service).toBeTruthy();
  }));
});
