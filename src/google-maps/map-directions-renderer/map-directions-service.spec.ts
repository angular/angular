import {TestBed} from '@angular/core/testing';
import {MapDirectionsResponse, MapDirectionsService} from './map-directions-service';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createDirectionsServiceConstructorSpy,
  createDirectionsServiceSpy
} from '../testing/fake-google-map-utils';

describe('MapDirectionsService', () => {
  let mapDirectionsService: MapDirectionsService;
  let directionsServiceConstructorSpy: jasmine.Spy;
  let directionsServiceSpy: jasmine.SpyObj<google.maps.DirectionsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapsModule],
    });

    directionsServiceSpy = createDirectionsServiceSpy();
    directionsServiceConstructorSpy =
        createDirectionsServiceConstructorSpy(directionsServiceSpy).and.callThrough();
    mapDirectionsService = TestBed.inject(MapDirectionsService);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('does not initialize the Google Maps Directions Service immediately', () => {
    expect(directionsServiceConstructorSpy).not.toHaveBeenCalled();
  });

  it('initializes the Google Maps Directions Service when `route` is called', () => {
    mapDirectionsService.route({}).subscribe();
    expect(directionsServiceConstructorSpy).toHaveBeenCalled();
  });

  it('calls route on inputs', () => {
    const result = {};
    const status = 'OK';
    directionsServiceSpy.route.and.callFake((_request: google.maps.DirectionsRequest,
        callback: Function) => {
      callback(result, status);
    });
    const request: google.maps.DirectionsRequest = {};
    mapDirectionsService.route(request).subscribe(response => {
      expect(response).toEqual({result, status} as MapDirectionsResponse);
    });
  });
});
