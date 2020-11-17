import {Component, ViewChild} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS} from '../google-map/google-map';

import {GoogleMapsModule} from '../google-maps-module';
import {MapMarker} from '../map-marker/map-marker';
import {
  createInfoWindowConstructorSpy,
  createInfoWindowSpy,
  createMapConstructorSpy,
  createMapSpy
} from '../testing/fake-google-map-utils';
import {MapInfoWindow} from './map-info-window';

describe('MapInfoWindow', () => {
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

  it('initializes a Google Map Info Window', () => {
    const infoWindowSpy = createInfoWindowSpy({});
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      position: undefined,
      content: jasmine.any(Node),
    });
  });

  it('sets position', () => {
    const position: google.maps.LatLngLiteral = {lat: 5, lng: 7};
    const infoWindowSpy = createInfoWindowSpy({position});
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = position;
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      position,
      content: jasmine.any(Node),
    });
  });

  it('sets options', () => {
    const options: google.maps.InfoWindowOptions = {
      position: {lat: 3, lng: 5},
      maxWidth: 50,
      disableAutoPan: true,
    };
    const infoWindowSpy = createInfoWindowSpy(options);
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      ...options,
      content: jasmine.any(Node),
    });
  });

  it('gives preference to position over options', () => {
    const position: google.maps.LatLngLiteral = {lat: 5, lng: 7};
    const options: google.maps.InfoWindowOptions = {
      position: {lat: 3, lng: 5},
      maxWidth: 50,
      disableAutoPan: true,
    };
    const infoWindowSpy = createInfoWindowSpy({...options, position});
    const infoWindowConstructorSpy =
        createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.componentInstance.position = position;
    fixture.detectChanges();

    expect(infoWindowConstructorSpy).toHaveBeenCalledWith({
      ...options,
      position,
      content: jasmine.any(Node),
    });
  });

  it('exposes methods that change the configuration of the info window', () => {
    const fakeMarker = {} as unknown as google.maps.Marker;
    const fakeMarkerComponent = {
      marker: fakeMarker,
      getAnchor: () => fakeMarker
    } as unknown as MapMarker;
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const infoWindowComponent = fixture.debugElement.query(By.directive(
        MapInfoWindow))!.injector.get<MapInfoWindow>(MapInfoWindow);
    fixture.detectChanges();

    infoWindowComponent.close();
    expect(infoWindowSpy.close).toHaveBeenCalled();

    infoWindowComponent.open(fakeMarkerComponent);
    expect(infoWindowSpy.open).toHaveBeenCalledWith(mapSpy, fakeMarker);
  });

  it('should not try to reopen info window multiple times for the same marker', () => {
    const fakeMarker = {} as unknown as google.maps.Marker;
    const fakeMarkerComponent = {
      marker: fakeMarker,
      getAnchor: () => fakeMarker
    } as unknown as MapMarker;
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const infoWindowComponent = fixture.debugElement.query(By.directive(
        MapInfoWindow))!.injector.get<MapInfoWindow>(MapInfoWindow);
    fixture.detectChanges();

    infoWindowComponent.open(fakeMarkerComponent);
    expect(infoWindowSpy.open).toHaveBeenCalledTimes(1);

    infoWindowComponent.open(fakeMarkerComponent);
    expect(infoWindowSpy.open).toHaveBeenCalledTimes(1);

    infoWindowComponent.close();
    infoWindowComponent.open(fakeMarkerComponent);
    expect(infoWindowSpy.open).toHaveBeenCalledTimes(2);
  });

  it('exposes methods that provide information about the info window', () => {
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const infoWindowComponent = fixture.debugElement.query(By.directive(
        MapInfoWindow))!.injector.get<MapInfoWindow>(MapInfoWindow);
    fixture.detectChanges();

    infoWindowSpy.getContent.and.returnValue('test content');
    expect(infoWindowComponent.getContent()).toBe('test content');

    infoWindowComponent.getPosition();
    expect(infoWindowSpy.getPosition).toHaveBeenCalled();

    infoWindowSpy.getZIndex.and.returnValue(5);
    expect(infoWindowComponent.getZIndex()).toBe(5);
  });

  it('initializes info window event handlers', () => {
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const addSpy = infoWindowSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('closeclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('content_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('domready', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('position_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('zindex_changed', jasmine.any(Function));
  });

  it('should be able to add an event listener after init', () => {
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const addSpy = infoWindowSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).not.toHaveBeenCalledWith('zindex_changed', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.infoWindow.zindexChanged.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('zindex_changed', jasmine.any(Function));
    subscription.unsubscribe();
  });

  it('should be able to open an info window without passing in an anchor', () => {
    const infoWindowSpy = createInfoWindowSpy({});
    createInfoWindowConstructorSpy(infoWindowSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const infoWindowComponent = fixture.debugElement.query(By.directive(
        MapInfoWindow))!.injector.get<MapInfoWindow>(MapInfoWindow);
    fixture.detectChanges();

    infoWindowComponent.open();
    expect(infoWindowSpy.open).toHaveBeenCalledTimes(1);
  });

});

@Component({
  selector: 'test-app',
  template: `<google-map>
               <map-info-window [position]="position"
                                [options]="options"
                                (closeclick)="handleClose()">
                 test content
               </map-info-window>
             </google-map>`,
})
class TestApp {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  position?: google.maps.LatLngLiteral;
  options?: google.maps.InfoWindowOptions;

  handleClose() {}
}
