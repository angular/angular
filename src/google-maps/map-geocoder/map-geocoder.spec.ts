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

  it('initializes the Google Maps Geocoder', () => {
    expect(geocoderConstructorSpy).toHaveBeenCalled();
  });

  it('calls geocode on inputs', () => {
    const results: google.maps.GeocoderResult[] = [];
    const status = 'OK';
    geocoderSpy.geocode.and.callFake((_: google.maps.GeocoderRequest, callback: Function) => {
      callback(results, status);
    });
    const request: google.maps.DirectionsRequest = {};
    geocoder.geocode(request).subscribe(response => {
      expect(response).toEqual({results, status} as MapGeocoderResponse);
    });
  });
});
