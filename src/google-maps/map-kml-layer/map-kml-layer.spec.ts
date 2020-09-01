import {Component, ViewChild} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {DEFAULT_OPTIONS} from '../google-map/google-map';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createKmlLayerConstructorSpy,
  createKmlLayerSpy,
  createMapConstructorSpy,
  createMapSpy,
} from '../testing/fake-google-map-utils';

import {MapKmlLayer} from './map-kml-layer';

const DEMO_URL = 'www.test.kml';
const DEFAULT_KML_OPTIONS: google.maps.KmlLayerOptions = {
  clickable: true,
  preserveViewport: true,
  url: DEMO_URL,
};

describe('MapKmlLayer', () => {
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

  it('initializes a Google Map Kml Layer', () => {
    const kmlLayerSpy = createKmlLayerSpy({});
    const kmlLayerConstructorSpy = createKmlLayerConstructorSpy(kmlLayerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(kmlLayerConstructorSpy).toHaveBeenCalledWith({url: undefined});
    expect(kmlLayerSpy.setMap).toHaveBeenCalledWith(mapSpy);
  });

  it('sets url from input', () => {
    const options: google.maps.KmlLayerOptions = {url: DEMO_URL};
    const kmlLayerSpy = createKmlLayerSpy(options);
    const kmlLayerConstructorSpy = createKmlLayerConstructorSpy(kmlLayerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.url = DEMO_URL;
    fixture.detectChanges();

    expect(kmlLayerConstructorSpy).toHaveBeenCalledWith(options);
  });

  it('gives precedence to url input over options', () => {
    const expectedUrl = 'www.realurl.kml';
    const expectedOptions: google.maps.KmlLayerOptions = {...DEFAULT_KML_OPTIONS, url: expectedUrl};
    const kmlLayerSpy = createKmlLayerSpy(expectedOptions);
    const kmlLayerConstructorSpy = createKmlLayerConstructorSpy(kmlLayerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = DEFAULT_KML_OPTIONS;
    fixture.componentInstance.url = expectedUrl;
    fixture.detectChanges();

    expect(kmlLayerConstructorSpy).toHaveBeenCalledWith(expectedOptions);
  });

  it('exposes methods that provide information about the KmlLayer', () => {
    const kmlLayerSpy = createKmlLayerSpy(DEFAULT_KML_OPTIONS);
    createKmlLayerConstructorSpy(kmlLayerSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    const kmlLayerComponent = fixture.debugElement.query(By.directive(
        MapKmlLayer))!.injector.get<MapKmlLayer>(MapKmlLayer);
    fixture.detectChanges();

    kmlLayerComponent.getDefaultViewport();
    expect(kmlLayerSpy.getDefaultViewport).toHaveBeenCalled();

    const metadata: google.maps.KmlLayerMetadata = {
      author: {
        email: 'test@test.com',
        name: 'author',
        uri: 'www.author.com',
      },
      description: 'test',
      hasScreenOverlays: true,
      name: 'metadata',
      snippet: '...',
    };
    kmlLayerSpy.getMetadata.and.returnValue(metadata);
    expect(kmlLayerComponent.getMetadata()).toBe(metadata);

    kmlLayerComponent.getStatus();
    expect(kmlLayerSpy.getStatus).toHaveBeenCalled();

    kmlLayerSpy.getUrl.and.returnValue(DEMO_URL);
    expect(kmlLayerComponent.getUrl()).toBe(DEMO_URL);

    kmlLayerSpy.getZIndex.and.returnValue(3);
    expect(kmlLayerComponent.getZIndex()).toBe(3);
  });

  it('initializes KmlLayer event handlers', () => {
    const kmlLayerSpy = createKmlLayerSpy(DEFAULT_KML_OPTIONS);
    createKmlLayerConstructorSpy(kmlLayerSpy).and.callThrough();

    const addSpy = kmlLayerSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('defaultviewport_changed', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('status_changed', jasmine.any(Function));
  });

  it('should be able to add an event listener after init', () => {
    const kmlLayerSpy = createKmlLayerSpy(DEFAULT_KML_OPTIONS);
    createKmlLayerConstructorSpy(kmlLayerSpy).and.callThrough();

    const addSpy = kmlLayerSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).not.toHaveBeenCalledWith('defaultviewport_changed', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.kmlLayer.defaultviewportChanged.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('defaultviewport_changed', jasmine.any(Function));
    subscription.unsubscribe();
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
                <map-kml-layer [options]="options"
                               [url]="url"
                               (kmlClick)="handleClick()"
                               (statusChanged)="handleStatusChange()">
                </map-kml-layer>
            </google-map>`,
})
class TestApp {
  @ViewChild(MapKmlLayer) kmlLayer: MapKmlLayer;
  options?: google.maps.KmlLayerOptions;
  url?: string;

  handleClick() {}

  handleStatusChange() {}
}
