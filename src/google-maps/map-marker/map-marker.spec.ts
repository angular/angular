import {Component, ViewChild} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';

import {DEFAULT_OPTIONS} from '../google-map/google-map';

import {GoogleMapsModule} from '../google-maps-module';
import {
  createMapConstructorSpy,
  createMapSpy,
  createMarkerConstructorSpy,
  createMarkerSpy
} from '../testing/fake-google-map-utils';
import {DEFAULT_MARKER_OPTIONS, MapMarker} from './map-marker';

describe('MapMarker', () => {
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

  it('initializes a Google Map marker', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith({
      ...DEFAULT_MARKER_OPTIONS,
      title: undefined,
      label: undefined,
      clickable: undefined,
      map: mapSpy,
    });
  });

  it('sets marker inputs', () => {
    const options: google.maps.MarkerOptions = {
      position: {lat: 3, lng: 5},
      title: 'marker title',
      label: 'marker label',
      clickable: false,
      map: mapSpy,
    };
    const markerSpy = createMarkerSpy(options);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = options.position;
    fixture.componentInstance.title = options.title;
    fixture.componentInstance.label = options.label;
    fixture.componentInstance.clickable = options.clickable;
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith(options);
  });

  it('sets marker options, ignoring map', () => {
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
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith({...options, map: mapSpy});
  });

  it('gives precedence to specific inputs over options', () => {
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
      map: mapSpy,
    };
    const markerSpy = createMarkerSpy(options);
    const markerConstructorSpy = createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.position = expectedOptions.position;
    fixture.componentInstance.title = expectedOptions.title;
    fixture.componentInstance.label = expectedOptions.label;
    fixture.componentInstance.clickable = expectedOptions.clickable;
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    expect(markerConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  });

  it('exposes methods that provide information about the marker', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    createMarkerConstructorSpy(markerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    const marker = fixture.componentInstance.marker;

    markerSpy.getAnimation.and.returnValue(null);
    expect(marker.getAnimation()).toBe(null);

    markerSpy.getClickable.and.returnValue(true);
    expect(marker.getClickable()).toBe(true);

    markerSpy.getCursor.and.returnValue('cursor');
    expect(marker.getCursor()).toBe('cursor');

    markerSpy.getDraggable.and.returnValue(true);
    expect(marker.getDraggable()).toBe(true);

    markerSpy.getIcon.and.returnValue('icon');
    expect(marker.getIcon()).toBe('icon');

    markerSpy.getLabel.and.returnValue(null);
    expect(marker.getLabel()).toBe(null);

    markerSpy.getOpacity.and.returnValue(5);
    expect(marker.getOpacity()).toBe(5);

    markerSpy.getPosition.and.returnValue(null);
    expect(marker.getPosition()).toEqual(null);

    markerSpy.getShape.and.returnValue(null);
    expect(marker.getShape()).toBe(null);

    markerSpy.getTitle.and.returnValue('title');
    expect(marker.getTitle()).toBe('title');

    markerSpy.getVisible.and.returnValue(true);
    expect(marker.getVisible()).toBe(true);

    markerSpy.getZIndex.and.returnValue(2);
    expect(marker.getZIndex()).toBe(2);
  });

  it('initializes marker event handlers', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    createMarkerConstructorSpy(markerSpy).and.callThrough();

    const addSpy = markerSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('position_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('animation_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('clickable_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('cursor_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dblclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('drag', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('draggable_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragstart', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('flat_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('icon_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mousedown', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseout', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseover', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseup', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('rightclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('shape_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('title_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('visible_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('zindex_changed', jasmine.any(Function));
  });

  it('should be able to add an event listener after init', () => {
    const markerSpy = createMarkerSpy(DEFAULT_MARKER_OPTIONS);
    createMarkerConstructorSpy(markerSpy).and.callThrough();

    const addSpy = markerSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).not.toHaveBeenCalledWith('flat_changed', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.marker.flatChanged.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('flat_changed', jasmine.any(Function));
    subscription.unsubscribe();
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
               <map-marker [title]="title"
                           [position]="position"
                           [label]="label"
                           [clickable]="clickable"
                           [options]="options"
                           (mapClick)="handleClick()"
                           (positionChanged)="handlePositionChanged()">
               </map-marker>
             </google-map>`,
})
class TestApp {
  @ViewChild(MapMarker) marker: MapMarker;
  title?: string;
  position?: google.maps.LatLng|google.maps.LatLngLiteral;
  label?: string|google.maps.MarkerLabel;
  clickable?: boolean;
  options?: google.maps.MarkerOptions;

  handleClick() {}

  handlePositionChanged() {}
}
