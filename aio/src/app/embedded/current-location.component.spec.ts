import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { CurrentLocationComponent } from './current-location.component';


describe('CurrentLocationComponent', () => {
  let locationService: MockLocationService;

  beforeEach(async(() => {
    locationService = new MockLocationService('initial/url');

    TestBed.configureTestingModule({
      declarations: [ CurrentLocationComponent ],
      providers: [
        { provide: LocationService, useValue: locationService }
      ]
    });
    TestBed.compileComponents();
  }));

  it('should render the current location', () => {
    const fixture = TestBed.createComponent(CurrentLocationComponent);
    const element: HTMLElement = fixture.nativeElement;

    fixture.detectChanges();
    expect(element.innerText).toEqual('initial/url');

    locationService.urlSubject.next('next/url');

    fixture.detectChanges();
    expect(element.innerText).toEqual('next/url');
  });
});
