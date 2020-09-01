import {Component, ViewChild} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS} from '../google-map/google-map';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createMapConstructorSpy,
  createMapSpy,
  createPolylineConstructorSpy,
  createPolylineSpy,
} from '../testing/fake-google-map-utils';

import {MapPolyline} from './map-polyline';

describe('MapPolyline', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  let polylinePath: google.maps.LatLngLiteral[];
  let polylineOptions: google.maps.PolylineOptions;

  beforeEach(waitForAsync(() => {
    polylinePath = [{ lat: 25, lng: 26 }, { lat: 26, lng: 27 }, { lat: 30, lng: 34 }];
    polylineOptions = {
      path: polylinePath,
      strokeColor: 'grey',
      strokeOpacity: 0.8
    };
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

  it('initializes a Google Map Polyline', () => {
    const polylineSpy = createPolylineSpy({});
    const polylineConstructorSpy = createPolylineConstructorSpy(polylineSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(polylineConstructorSpy).toHaveBeenCalledWith({path: undefined});
    expect(polylineSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });

  it('sets path from input', () => {
    const path: google.maps.LatLngLiteral[] = [{lat: 3, lng: 5}];
    const options: google.maps.PolylineOptions = {path};
    const polylineSpy = createPolylineSpy(options);
    const polylineConstructorSpy = createPolylineConstructorSpy(polylineSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.path = path;
    fixture.detectChanges();

    expect(polylineConstructorSpy).toHaveBeenCalledWith(options);
  });

  it('gives precedence to path input over options', () => {
    const path: google.maps.LatLngLiteral[] = [{lat: 3, lng: 5}];
    const expectedOptions: google.maps.PolylineOptions = {...polylineOptions, path};
    const polylineSpy = createPolylineSpy(expectedOptions);
    const polylineConstructorSpy = createPolylineConstructorSpy(polylineSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = polylineOptions;
    fixture.componentInstance.path = path;
    fixture.detectChanges();

    expect(polylineConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  });

  it('exposes methods that provide information about the Polyline', () => {
    const polylineSpy = createPolylineSpy(polylineOptions);
    createPolylineConstructorSpy(polylineSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const polylineComponent = fixture.debugElement.query(By.directive(
        MapPolyline))!.injector.get<MapPolyline>(MapPolyline);
    fixture.detectChanges();

    polylineSpy.getDraggable.and.returnValue(true);
    expect(polylineComponent.getDraggable()).toBe(true);

    polylineSpy.getEditable.and.returnValue(true);
    expect(polylineComponent.getEditable()).toBe(true);

    polylineComponent.getPath();
    expect(polylineSpy.getPath).toHaveBeenCalled();

    polylineSpy.getVisible.and.returnValue(true);
    expect(polylineComponent.getVisible()).toBe(true);
  });

  it('initializes Polyline event handlers', () => {
    const polylineSpy = createPolylineSpy(polylineOptions);
    createPolylineConstructorSpy(polylineSpy).and.callThrough();

    const addSpy = polylineSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dblclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('drag', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragstart', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mousedown', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mousemove', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseout', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseover', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseup', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('rightclick', jasmine.any(Function));
  });

  it('should be able to add an event listener after init', () => {
    const polylineSpy = createPolylineSpy(polylineOptions);
    createPolylineConstructorSpy(polylineSpy).and.callThrough();

    const addSpy = polylineSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.polyline.polylineDragend.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('dragend', jasmine.any(Function));
    subscription.unsubscribe();
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
                <map-polyline [options]="options"
                              [path]="path"
                              (polylineClick)="handleClick()"
                              (polylineRightclick)="handleRightclick()">
                </map-polyline>
            </google-map>`,
})
class TestApp {
  @ViewChild(MapPolyline) polyline: MapPolyline;
  options?: google.maps.PolylineOptions;
  path?: google.maps.LatLngLiteral[];

  handleClick() {}

  handleRightclick() {}
}
