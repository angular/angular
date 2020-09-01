import {Component} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';

import {DEFAULT_OPTIONS} from '../google-map/google-map';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createBicyclingLayerConstructorSpy,
  createBicyclingLayerSpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';

describe('MapBicyclingLayer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapsModule],
      declarations: [TestApp],
    });
  }));

  beforeEach(() => {
    TestBed.compileComponents();

    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Bicycling Layer', () => {
    const bicyclingLayerSpy = createBicyclingLayerSpy();
    const bicyclingLayerConstructorSpy =
        createBicyclingLayerConstructorSpy(bicyclingLayerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(bicyclingLayerConstructorSpy).toHaveBeenCalled();
    expect(bicyclingLayerSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
                <map-bicycling-layer></map-bicycling-layer>
            </google-map>`,
})
class TestApp {
}
