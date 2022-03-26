import {Component, ViewChild} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';

import {DEFAULT_OPTIONS} from '../google-map/google-map';

import {GoogleMapsModule} from '../google-maps-module';
import {
  createMapConstructorSpy,
  createMapSpy,
  createHeatmapLayerConstructorSpy,
  createHeatmapLayerSpy,
  createLatLngSpy,
  createLatLngConstructorSpy,
} from '../testing/fake-google-map-utils';
import {HeatmapData, MapHeatmapLayer} from './map-heatmap-layer';

describe('MapHeatmapLayer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  let latLngSpy: jasmine.SpyObj<google.maps.LatLng>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GoogleMapsModule],
      declarations: [TestApp],
    });
  }));

  beforeEach(() => {
    TestBed.compileComponents();
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    latLngSpy = createLatLngSpy();
    createMapConstructorSpy(mapSpy).and.callThrough();
    createLatLngConstructorSpy(latLngSpy).and.callThrough();
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map heatmap layer', () => {
    const heatmapSpy = createHeatmapLayerSpy();
    const heatmapConstructorSpy = createHeatmapLayerConstructorSpy(heatmapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(heatmapConstructorSpy).toHaveBeenCalledWith({
      data: [],
      map: mapSpy,
    });
  });

  it('should throw if the `visualization` library has not been loaded', () => {
    createHeatmapLayerConstructorSpy(createHeatmapLayerSpy());
    delete (window.google.maps as any).visualization;

    expect(() => {
      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
    }).toThrowError(/Namespace `google.maps.visualization` not found, cannot construct heatmap/);
  });

  it('sets heatmap inputs', () => {
    const options: google.maps.visualization.HeatmapLayerOptions = {
      map: mapSpy,
      data: [
        new google.maps.LatLng(37.782, -122.447),
        new google.maps.LatLng(37.782, -122.445),
        new google.maps.LatLng(37.782, -122.443),
      ],
    };
    const heatmapSpy = createHeatmapLayerSpy();
    const heatmapConstructorSpy = createHeatmapLayerConstructorSpy(heatmapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.data = options.data;
    fixture.detectChanges();

    expect(heatmapConstructorSpy).toHaveBeenCalledWith(options);
  });

  it('sets heatmap options, ignoring map', () => {
    const options: Partial<google.maps.visualization.HeatmapLayerOptions> = {
      radius: 5,
      dissipating: true,
    };
    const data = [
      new google.maps.LatLng(37.782, -122.447),
      new google.maps.LatLng(37.782, -122.445),
      new google.maps.LatLng(37.782, -122.443),
    ];
    const heatmapSpy = createHeatmapLayerSpy();
    const heatmapConstructorSpy = createHeatmapLayerConstructorSpy(heatmapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.data = data;
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    expect(heatmapConstructorSpy).toHaveBeenCalledWith({...options, map: mapSpy, data});
  });

  it('exposes methods that provide information about the heatmap', () => {
    const heatmapSpy = createHeatmapLayerSpy();
    createHeatmapLayerConstructorSpy(heatmapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    const heatmap = fixture.componentInstance.heatmap;

    heatmapSpy.getData.and.returnValue([] as any);
    expect(heatmap.getData()).toEqual([]);
  });

  it('should update the heatmap data when the input changes', () => {
    const heatmapSpy = createHeatmapLayerSpy();
    const heatmapConstructorSpy = createHeatmapLayerConstructorSpy(heatmapSpy).and.callThrough();
    let data = [
      new google.maps.LatLng(1, 2),
      new google.maps.LatLng(3, 4),
      new google.maps.LatLng(5, 6),
    ];

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.data = data;
    fixture.detectChanges();

    expect(heatmapConstructorSpy).toHaveBeenCalledWith(jasmine.objectContaining({data}));
    data = [
      new google.maps.LatLng(7, 8),
      new google.maps.LatLng(9, 10),
      new google.maps.LatLng(11, 12),
    ];
    fixture.componentInstance.data = data;
    fixture.detectChanges();

    expect(heatmapSpy.setData).toHaveBeenCalledWith(data);
  });

  it('should create a LatLng object if a LatLngLiteral is passed in', () => {
    const latLngConstructor = createLatLngConstructorSpy(latLngSpy).and.callThrough();
    createHeatmapLayerConstructorSpy(createHeatmapLayerSpy()).and.callThrough();
    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.data = [
      {lat: 1, lng: 2},
      {lat: 3, lng: 4},
    ];
    fixture.detectChanges();

    expect(latLngConstructor).toHaveBeenCalledWith(1, 2);
    expect(latLngConstructor).toHaveBeenCalledWith(3, 4);
    expect(latLngConstructor).toHaveBeenCalledTimes(2);
  });
});

@Component({
  selector: 'test-app',
  template: `
    <google-map>
      <map-heatmap-layer [data]="data" [options]="options">
      </map-heatmap-layer>
    </google-map>`,
})
class TestApp {
  @ViewChild(MapHeatmapLayer) heatmap: MapHeatmapLayer;
  options?: Partial<google.maps.visualization.HeatmapLayerOptions>;
  data?: HeatmapData | null;
}
