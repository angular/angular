import {Component} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';

import {DEFAULT_OPTIONS} from '../google-map/google-map';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createMapConstructorSpy,
  createMapSpy,
  createTrafficLayerConstructorSpy,
  createTrafficLayerSpy,
} from '../testing/fake-google-map-utils';

describe('MapTrafficLayer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  const trafficLayerOptions: google.maps.TrafficLayerOptions = {autoRefresh: false};

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

  it('initializes a Google Map Traffic Layer', () => {
    const trafficLayerSpy = createTrafficLayerSpy(trafficLayerOptions);
    const trafficLayerConstructorSpy =
        createTrafficLayerConstructorSpy(trafficLayerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.autoRefresh = false;
    fixture.detectChanges();

    expect(trafficLayerConstructorSpy).toHaveBeenCalledWith(trafficLayerOptions);
    expect(trafficLayerSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
                <map-traffic-layer [autoRefresh]="autoRefresh">
                </map-traffic-layer>
            </google-map>`,
})
class TestApp {
  autoRefresh?: boolean;
}
