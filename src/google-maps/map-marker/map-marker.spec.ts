import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {
  createMarkerConstructorSpy,
  createMarkerSpy,
  TestingWindow
} from '../testing/fake-google-map-utils';

import {GoogleMapsModule} from '../google-maps-module';
import {DEFAULT_MARKER_OPTIONS, MapMarker} from './map-marker';

describe('MapMarker', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapsModule],
      declarations: [TestApp],
    });
  }));

  beforeEach(() => {
    TestBed.compileComponents();
  });

  afterEach(() => {
    const testingWindow: TestingWindow = window;
    delete testingWindow.google;
  });

  it('initializes a Google Map marker', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const fakeMap = {} as unknown as google.maps.Map;
    const markerComponent = fixture.debugElement.query(By.directive(MapMarker)).componentInstance;
    markerComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith({
      ...DEFAULT_MARKER_OPTIONS,
      title: undefined,
      label: undefined,
      clickable: undefined,
      map: fakeMap
    });
  });

  it('sets marker inputs', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const options: google.maps.MarkerOptions = {
      position: {lat: 3, lng: 5},
      title: 'marker title',
      label: 'marker label',
      clickable: false,
      map: fakeMap,
    };
    const markerSpy = createMarkerSpy(options);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = options.position;
    fixture.componentInstance.title = options.title;
    fixture.componentInstance.label = options.label;
    fixture.componentInstance.clickable = options.clickable;
    const markerComponent = fixture.debugElement.query(By.directive(MapMarker)).componentInstance;
    markerComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith(options);
  });

  it('sets marker options, ignoring map', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const options: google.maps.MarkerOptions = {
      position: {lat: 3, lng: 5},
      title: 'marker title',
      label: 'marker label',
      clickable: false,
      icon: 'icon name',
    };
    const markerSpy = createMarkerSpy(options);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    const markerComponent = fixture.debugElement.query(By.directive(MapMarker)).componentInstance;
    markerComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith({...options, map: fakeMap});
  });

  it('gives precedence to specific inputs over options', () => {
    const fakeMap = {} as unknown as google.maps.Map;
    const options: google.maps.MarkerOptions = {
      position: {lat: 3, lng: 5},
      title: 'marker title',
      label: 'marker label',
      clickable: false,
      icon: 'icon name',
    };
    const expectedOptions: google.maps.MarkerOptions = {
      position: {lat: 5, lng: 12},
      title: 'updated title',
      label: 'updated label',
      clickable: true,
      icon: 'icon name',
      map: fakeMap,
    };
    const markerSpy = createMarkerSpy(options);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = expectedOptions.position;
    fixture.componentInstance.title = expectedOptions.title;
    fixture.componentInstance.label = expectedOptions.label;
    fixture.componentInstance.clickable = expectedOptions.clickable;
    fixture.componentInstance.options = options;
    const markerComponent = fixture.debugElement.query(By.directive(MapMarker)).componentInstance;
    markerComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  });

  it('sets the map on the marker only once', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const fakeMap = {} as unknown as google.maps.Map;
    const fakeMap2 = {testValue: 'test'} as unknown as google.maps.Map;
    const markerComponent = fixture.debugElement.query(By.directive(MapMarker)).componentInstance;
    markerComponent._setMap(fakeMap);
    markerComponent._setMap(fakeMap2);
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith({
      ...DEFAULT_MARKER_OPTIONS,
      title: undefined,
      label: undefined,
      clickable: undefined,
      map: fakeMap
    });
    expect(markerSpy.setOptions).not.toHaveBeenCalled();
  });

  it('exposes methods that provide information about the marker', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const fakeMap = {} as unknown as google.maps.Map;
    const markerComponent = fixture.debugElement.query(By.directive(MapMarker)).componentInstance;
    markerComponent._setMap(fakeMap);
    fixture.detectChanges();

    markerSpy.getAnimation.and.returnValue(null);
    expect(markerComponent.getAnimation()).toBe(null);

    markerSpy.getClickable.and.returnValue(true);
    expect(markerComponent.getClickable()).toBe(true);

    markerSpy.getCursor.and.returnValue('cursor');
    expect(markerComponent.getCursor()).toBe('cursor');

    markerSpy.getDraggable.and.returnValue(true);
    expect(markerComponent.getDraggable()).toBe(true);

    markerSpy.getIcon.and.returnValue('icon');
    expect(markerComponent.getIcon()).toBe('icon');

    markerSpy.getLabel.and.returnValue(null);
    expect(markerComponent.getLabel()).toBe(null);

    markerSpy.getOpacity.and.returnValue(5);
    expect(markerComponent.getOpacity()).toBe(5);

    markerSpy.getPosition.and.returnValue(null);
    expect(markerComponent.getPosition()).toEqual(null);

    markerSpy.getShape.and.returnValue(null);
    expect(markerComponent.getShape()).toBe(null);

    markerSpy.getTitle.and.returnValue('title');
    expect(markerComponent.getTitle()).toBe('title');

    markerSpy.getVisible.and.returnValue(true);
    expect(markerComponent.getVisible()).toBe(true);

    markerSpy.getZIndex.and.returnValue(2);
    expect(markerComponent.getZIndex()).toBe(2);
  });

  it('initializes marker event handlers', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const fakeMap = {} as unknown as google.maps.Map;
    const markerComponent = fixture.debugElement.query(By.directive(MapMarker)).componentInstance;
    markerComponent._setMap(fakeMap);
    fixture.detectChanges();

    expect(markerSpy.addListener)
        .not.toHaveBeenCalledWith('animation_changed', jasmine.any(Function));
    expect(markerSpy.addListener).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(markerSpy.addListener)
        .not.toHaveBeenCalledWith('clickable_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('cursor_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('dblclick', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('drag', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));
    expect(markerSpy.addListener)
        .not.toHaveBeenCalledWith('draggable_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('dragstart', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('flat_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('icon_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('mousedown', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('mouseout', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('mouseover', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('mouseup', jasmine.any(Function));
    expect(markerSpy.addListener).toHaveBeenCalledWith('position_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('rightclick', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('shape_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('title_changed', jasmine.any(Function));
    expect(markerSpy.addListener)
        .not.toHaveBeenCalledWith('visible_changed', jasmine.any(Function));
    expect(markerSpy.addListener).not.toHaveBeenCalledWith('zindex_changed', jasmine.any(Function));
  });
});

@Component({
  selector: 'test-app',
  template: `<map-marker [title]="title"
                         [position]="position"
                         [label]="label"
                         [clickable]="clickable"
                         [options]="options"
                         (mapClick)="handleClick()"
                         (positionChanged)="handlePositionChanged()"></map-marker>`,
})
class TestApp {
  title?: string;
  position?: google.maps.LatLng|google.maps.LatLngLiteral;
  label?: string|google.maps.MarkerLabel;
  clickable?: boolean;
  options?: google.maps.MarkerOptions;

  handleClick() {}

  handlePositionChanged() {}
}
