import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_HEIGHT, DEFAULT_OPTIONS, DEFAULT_WIDTH, GoogleMapModule} from './index';
import {
  createMapConstructorSpy,
  createMapSpy,
  TestingWindow
} from './testing/fake-google-map-utils';

describe('GoogleMap', () => {
  let mapConstructorSpy: jasmine.Spy;
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapModule],
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

  it('throws an error is the Google Maps JavaScript API was not loaded', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy, false);

    expect(() => TestBed.createComponent(TestApp))
        .toThrow(new Error(
            'Namespace google not found, cannot construct embedded google ' +
            'map. Please install the Google Maps JavaScript API: ' +
            'https://developers.google.com/maps/documentation/javascript/' +
            'tutorial#Loading_the_Maps_API'));
  });

  it('initializes a Google map', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.style.height).toBe(DEFAULT_HEIGHT);
    expect(container.nativeElement.style.width).toBe(DEFAULT_WIDTH);
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, DEFAULT_OPTIONS);
  });

  it('sets height and width of the map', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.height = '750px';
    fixture.componentInstance.width = '400px';
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'));
    expect(container.nativeElement.style.height).toBe('750px');
    expect(container.nativeElement.style.width).toBe('400px');
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, DEFAULT_OPTIONS);

    fixture.componentInstance.height = '650px';
    fixture.componentInstance.width = '350px';
    fixture.detectChanges();

    expect(container.nativeElement.style.height).toBe('650px');
    expect(container.nativeElement.style.width).toBe('350px');
  });

  it('sets center and zoom of the map', () => {
    const options = {center: {lat: 3, lng: 5}, zoom: 7};
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.center = options.center;
    fixture.componentInstance.zoom = options.zoom;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'));
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, options);

    fixture.componentInstance.center = {lat: 8, lng: 9};
    fixture.componentInstance.zoom = 12;
    fixture.detectChanges();

    expect(mapSpy.setOptions).toHaveBeenCalledWith({center: {lat: 8, lng: 9}, zoom: 12});
  });

  it('sets map options', () => {
    const options = {center: {lat: 3, lng: 5}, zoom: 7, draggable: false};
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'));
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, options);

    fixture.componentInstance.options = {...options, heading: 170};
    fixture.detectChanges();

    expect(mapSpy.setOptions).toHaveBeenCalledWith({...options, heading: 170});
  });

  it('gives precedence to center and zoom over options', () => {
    const inputOptions = {center: {lat: 3, lng: 5}, zoom: 7, heading: 170};
    const correctedOptions = {center: {lat: 12, lng: 15}, zoom: 5, heading: 170};
    mapSpy = createMapSpy(correctedOptions);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.center = correctedOptions.center;
    fixture.componentInstance.zoom = correctedOptions.zoom;
    fixture.componentInstance.options = inputOptions;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'));
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, correctedOptions);
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map [height]="height"
                         [width]="width"
                         [center]="center"
                         [zoom]="zoom"
                         [options]="options"></google-map>`,
})
class TestApp {
  height?: string;
  width?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  options?: google.maps.MapOptions;
}
