import {TestBed} from '@angular/core/testing';
import {MapGeocoderResponse, MapGeocoder} from './map-geocoder';
import {GoogleMapsModule} from '../google-maps-module';
import {createGeocoderConstructorSpy, createGeocoderSpy} from '../testing/fake-google-map-utils';

describe('MapGeocoder', () => {
  let geocoder: MapGeocoder;
  let geocoderConstructorSpy: jasmine.Spy;
  let geocoderSpy: jasmine.SpyObj<google.maps.Geocoder>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapsModule],
    });

    geocoderSpy = createGeocoderSpy();
    geocoderConstructorSpy = createGeocoderConstructorSpy(geocoderSpy).and.callThrough();
    geocoder = TestBed.inject(MapGeocoder);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('does not initialize the Google Maps Geocoder immediately', () => {
    expect(geocoderConstructorSpy).not.toHaveBeenCalled();
  });

  it('initializes the Google Maps Geocoder after `geocode` is called', () => {
    geocoder.geocode({}).subscribe();
    expect(geocoderConstructorSpy).toHaveBeenCalled();
  });

  it('calls geocode on inputs', () => {
    const results: google.maps.GeocoderResult[] = [];
    const status = 'OK' as google.maps.GeocoderStatus;
    geocoderSpy.geocode.and.callFake((_request, callback) => {
      callback?.(results, status);
      return Promise.resolve({results});
    });

    geocoder.geocode({region: 'Europe'}).subscribe(response => {
      expect(response).toEqual({results, status} as MapGeocoderResponse);
    });
  });
});
