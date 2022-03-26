import {Component, ViewChild} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MapDirectionsRenderer} from './map-directions-renderer';
import {DEFAULT_OPTIONS} from '../google-map/google-map';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createDirectionsRendererConstructorSpy,
  createDirectionsRendererSpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';

const DEFAULT_DIRECTIONS: google.maps.DirectionsResult = {
  geocoded_waypoints: [],
  routes: [],
};

describe('MapDirectionsRenderer', () => {
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

  it('initializes a Google Maps DirectionsRenderer', () => {
    const directionsRendererSpy = createDirectionsRendererSpy({directions: DEFAULT_DIRECTIONS});
    const directionsRendererConstructorSpy =
      createDirectionsRendererConstructorSpy(directionsRendererSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = {directions: DEFAULT_DIRECTIONS};
    fixture.detectChanges();

    expect(directionsRendererConstructorSpy).toHaveBeenCalledWith({
      directions: DEFAULT_DIRECTIONS,
      map: jasmine.any(Object),
    });
    expect(directionsRendererSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });

  it('sets directions from directions input', () => {
    const directionsRendererSpy = createDirectionsRendererSpy({directions: DEFAULT_DIRECTIONS});
    const directionsRendererConstructorSpy =
      createDirectionsRendererConstructorSpy(directionsRendererSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.directions = DEFAULT_DIRECTIONS;
    fixture.detectChanges();

    expect(directionsRendererConstructorSpy).toHaveBeenCalledWith({
      directions: DEFAULT_DIRECTIONS,
      map: jasmine.any(Object),
    });
    expect(directionsRendererSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });

  it('gives precedence to directions over options', () => {
    const updatedDirections: google.maps.DirectionsResult = {
      geocoded_waypoints: [{partial_match: false, place_id: 'test', types: []}],
      routes: [],
    };
    const directionsRendererSpy = createDirectionsRendererSpy({directions: updatedDirections});
    const directionsRendererConstructorSpy =
      createDirectionsRendererConstructorSpy(directionsRendererSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = {directions: DEFAULT_DIRECTIONS};
    fixture.componentInstance.directions = updatedDirections;
    fixture.detectChanges();

    expect(directionsRendererConstructorSpy).toHaveBeenCalledWith({
      directions: updatedDirections,
      map: jasmine.any(Object),
    });
    expect(directionsRendererSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });

  it('exposes methods that provide information from the DirectionsRenderer', () => {
    const directionsRendererSpy = createDirectionsRendererSpy({});
    createDirectionsRendererConstructorSpy(directionsRendererSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);

    const directionsRendererComponent = fixture.debugElement
      .query(By.directive(MapDirectionsRenderer))!
      .injector.get<MapDirectionsRenderer>(MapDirectionsRenderer);
    fixture.detectChanges();

    directionsRendererSpy.getDirections.and.returnValue(DEFAULT_DIRECTIONS);
    expect(directionsRendererComponent.getDirections()).toBe(DEFAULT_DIRECTIONS);

    directionsRendererComponent.getPanel();
    expect(directionsRendererSpy.getPanel).toHaveBeenCalled();

    directionsRendererSpy.getRouteIndex.and.returnValue(10);
    expect(directionsRendererComponent.getRouteIndex()).toBe(10);
  });

  it('initializes DirectionsRenderer event handlers', () => {
    const directionsRendererSpy = createDirectionsRendererSpy({});
    createDirectionsRendererConstructorSpy(directionsRendererSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(directionsRendererSpy.addListener).toHaveBeenCalledWith(
      'directions_changed',
      jasmine.any(Function),
    );
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
               <map-directions-renderer [options]="options"
                                        [directions]="directions"
                                        (directionsChanged)="handleDirectionsChanged()">
               </map-directions-renderer>
             </google-map>`,
})
class TestApp {
  @ViewChild(MapDirectionsRenderer) directionsRenderer: MapDirectionsRenderer;
  options?: google.maps.DirectionsRendererOptions;
  directions?: google.maps.DirectionsResult;

  handleDirectionsChanged() {}
}
