import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { CurrentLocationComponent } from './current-location.component';


describe('CurrentLocationComponent', () => {
  let element: HTMLElement;
  let fixture: ComponentFixture<CurrentLocationComponent>;
  let locationService: MockLocationService;

  beforeEach(() => {
    locationService = new MockLocationService('initial/url');

    TestBed.configureTestingModule({
      declarations: [ CurrentLocationComponent ],
      providers: [
        { provide: LocationService, useValue: locationService }
      ]
    });

    fixture = TestBed.createComponent(CurrentLocationComponent);
    element = fixture.nativeElement;
  });

  it('should render the current location', () => {
    fixture.detectChanges();
    expect(element.textContent).toEqual('initial/url');

    locationService.urlSubject.next('next/url');

    fixture.detectChanges();
    expect(element.textContent).toEqual('next/url');
  });
});
