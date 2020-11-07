import {Component, ViewChild} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {DEFAULT_OPTIONS} from '../google-map/google-map';
import {GoogleMapsModule} from '../google-maps-module';
import {
  createMapConstructorSpy,
  createMapSpy,
  createMarkerConstructorSpy,
  createMarkerClustererConstructorSpy,
  createMarkerClustererSpy,
  createMarkerSpy,
} from '../testing/fake-google-map-utils';
import {MapMarkerClusterer} from './map-marker-clusterer';

describe('MapMarkerClusterer', () => {
  let mapSpy: jasmine.SpyObj<google.maps.Map>;
  let markerClustererSpy: jasmine.SpyObj<MarkerClusterer>;
  let markerClustererConstructorSpy: jasmine.Spy;
  let fixture: ComponentFixture<TestApp>;

  const anyMarkerMatcher = jasmine.any(Object) as unknown as google.maps.Marker;

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

    const markerSpy = createMarkerSpy({});
    createMarkerConstructorSpy(markerSpy).and.callFake(() => {
      return createMarkerSpy({});
    });

    markerClustererSpy = createMarkerClustererSpy();
    markerClustererConstructorSpy = createMarkerClustererConstructorSpy(markerClustererSpy)
        .and.callThrough();

    fixture = TestBed.createComponent(TestApp);
  });

  afterEach(() => {
    (window.google as any) = undefined;
  });

  it('initializes a Google Map Marker Clusterer', () => {
    fixture.detectChanges();

    expect(markerClustererConstructorSpy).toHaveBeenCalledWith(mapSpy, [], {
      ariaLabelFn: undefined,
      averageCenter: undefined,
      batchSize: undefined,
      batchSizeIE: undefined,
      calculator: undefined,
      clusterClass: undefined,
      enableRetinalIcons: undefined,
      gridSize: undefined,
      ignoreHidden: undefined,
      imageExtension: undefined,
      imagePath: undefined,
      imageSizes: undefined,
      maxZoom: undefined,
      minimumClusterSize: undefined,
      styles: undefined,
      title: undefined,
      zIndex: undefined,
      zoomOnClick: undefined,
    });
  });

  it('sets marker clusterer inputs', () => {
    fixture.componentInstance.ariaLabelFn = (testString: string) => testString;
    fixture.componentInstance.averageCenter = true;
    fixture.componentInstance.batchSize = 1;
    fixture.componentInstance.clusterClass = 'testClusterClass';
    fixture.componentInstance.enableRetinalIcons = true;
    fixture.componentInstance.gridSize = 2;
    fixture.componentInstance.ignoreHidden = true;
    fixture.componentInstance.imageExtension = 'testImageExtension';
    fixture.componentInstance.imagePath = 'testImagePath';
    fixture.componentInstance.imageSizes = [3];
    fixture.componentInstance.maxZoom = 4;
    fixture.componentInstance.minimumClusterSize = 5;
    fixture.componentInstance.styles = [];
    fixture.componentInstance.title = 'testTitle';
    fixture.componentInstance.zIndex = 6;
    fixture.componentInstance.zoomOnClick = true;
    fixture.detectChanges();

    expect(markerClustererConstructorSpy).toHaveBeenCalledWith(mapSpy, [], {
      ariaLabelFn: jasmine.any(Function),
      averageCenter: true,
      batchSize: 1,
      batchSizeIE: undefined,
      calculator: undefined,
      clusterClass: 'testClusterClass',
      enableRetinalIcons: true,
      gridSize: 2,
      ignoreHidden: true,
      imageExtension: 'testImageExtension',
      imagePath: 'testImagePath',
      imageSizes: [3],
      maxZoom: 4,
      minimumClusterSize: 5,
      styles: [],
      title: 'testTitle',
      zIndex: 6,
      zoomOnClick: true,
    });
  });

  it('sets Google Maps Markers in the MarkerClusterer', () => {
    fixture.detectChanges();

    expect(markerClustererSpy.addMarkers)
        .toHaveBeenCalledWith([anyMarkerMatcher, anyMarkerMatcher]);
  });

  it('updates Google Maps Markers in the Marker Clusterer', () => {
    fixture.detectChanges();

    expect(markerClustererSpy.addMarkers)
        .toHaveBeenCalledWith([anyMarkerMatcher, anyMarkerMatcher]);

    fixture.componentInstance.state = 'state2';
    fixture.detectChanges();

    expect(markerClustererSpy.addMarkers).toHaveBeenCalledWith([anyMarkerMatcher], true);
    expect(markerClustererSpy.removeMarkers).toHaveBeenCalledWith([anyMarkerMatcher], true);
    expect(markerClustererSpy.repaint).toHaveBeenCalledTimes(1);

    fixture.componentInstance.state = 'state0';
    fixture.detectChanges();

    expect(markerClustererSpy.addMarkers).toHaveBeenCalledWith([], true);
    expect(markerClustererSpy.removeMarkers)
        .toHaveBeenCalledWith([anyMarkerMatcher, anyMarkerMatcher], true);
    expect(markerClustererSpy.repaint).toHaveBeenCalledTimes(2);
  });

  it('exposes marker clusterer methods', () => {
    fixture.detectChanges();
    const markerClustererComponent = fixture.componentInstance.markerClusterer;

    markerClustererComponent.fitMapToMarkers(5);
    expect(markerClustererSpy.fitMapToMarkers).toHaveBeenCalledWith(5);

    markerClustererSpy.getAverageCenter.and.returnValue(true);
    expect(markerClustererComponent.getAverageCenter()).toBe(true);

    markerClustererSpy.getBatchSizeIE.and.returnValue(6);
    expect(markerClustererComponent.getBatchSizeIE()).toBe(6);

    const calculator = (markers: google.maps.Marker[], count: number) => ({
      index: 1,
      text: 'testText',
      title: 'testTitle',
    });
    markerClustererSpy.getCalculator.and.returnValue(calculator);
    expect(markerClustererComponent.getCalculator()).toBe(calculator);

    markerClustererSpy.getClusterClass.and.returnValue('testClusterClass');
    expect(markerClustererComponent.getClusterClass()).toBe('testClusterClass');

    markerClustererSpy.getClusters.and.returnValue([]);
    expect(markerClustererComponent.getClusters()).toEqual([]);

    markerClustererSpy.getEnableRetinalIcons.and.returnValue(true);
    expect(markerClustererComponent.getEnableRetinalIcons()).toBe(true);

    markerClustererSpy.getGridSize.and.returnValue(7);
    expect(markerClustererComponent.getGridSize()).toBe(7);

    markerClustererSpy.getIgnoreHidden.and.returnValue(true);
    expect(markerClustererComponent.getIgnoreHidden()).toBe(true);

    markerClustererSpy.getImageExtension.and.returnValue('testImageExtension');
    expect(markerClustererComponent.getImageExtension()).toBe('testImageExtension');

    markerClustererSpy.getImagePath.and.returnValue('testImagePath');
    expect(markerClustererComponent.getImagePath()).toBe('testImagePath');

    markerClustererSpy.getImageSizes.and.returnValue([]);
    expect(markerClustererComponent.getImageSizes()).toEqual([]);

    markerClustererSpy.getMaxZoom.and.returnValue(8);
    expect(markerClustererComponent.getMaxZoom()).toBe(8);

    markerClustererSpy.getMinimumClusterSize.and.returnValue(9);
    expect(markerClustererComponent.getMinimumClusterSize()).toBe(9);

    markerClustererSpy.getStyles.and.returnValue([]);
    expect(markerClustererComponent.getStyles()).toEqual([]);

    markerClustererSpy.getTitle.and.returnValue('testTitle');
    expect(markerClustererComponent.getTitle()).toBe('testTitle');

    markerClustererSpy.getTotalClusters.and.returnValue(10);
    expect(markerClustererComponent.getTotalClusters()).toBe(10);

    markerClustererSpy.getTotalMarkers.and.returnValue(11);
    expect(markerClustererComponent.getTotalMarkers()).toBe(11);

    markerClustererSpy.getZIndex.and.returnValue(12);
    expect(markerClustererComponent.getZIndex()).toBe(12);

    markerClustererSpy.getZoomOnClick.and.returnValue(true);
    expect(markerClustererComponent.getZoomOnClick()).toBe(true);
  });

  it('initializes marker clusterer event handlers', () => {
    fixture.detectChanges();

    expect(markerClustererSpy.addListener)
        .toHaveBeenCalledWith('clusteringbegin', jasmine.any(Function));
    expect(markerClustererSpy.addListener)
        .not.toHaveBeenCalledWith('clusteringend', jasmine.any(Function));
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map>
               <map-marker-clusterer [ariaLabelFn]="ariaLabelFn"
                                     [averageCenter]="averageCenter"
                                     [batchSize]="batchSize"
                                     [batchSizeIE]="batchSizeIE"
                                     [calculator]="calculator"
                                     [clusterClass]="clusterClass"
                                     [enableRetinalIcons]="enableRetinalIcons"
                                     [gridSize]="gridSize"
                                     [ignoreHidden]="ignoreHidden"
                                     [imageExtension]="imageExtension"
                                     [imagePath]="imagePath"
                                     [imageSizes]="imageSizes"
                                     [maxZoom]="maxZoom"
                                     [minimumClusterSize]="minimumClusterSize"
                                     [styles]="styles"
                                     [title]="title"
                                     [zIndex]="zIndex"
                                     [zoomOnClick]="zoomOnClick"
                                     (clusteringbegin)="onClusteringBegin()">
                 <map-marker *ngIf="state === 'state1'"></map-marker>
                 <map-marker *ngIf="state === 'state1' || state === 'state2'"></map-marker>
                 <map-marker *ngIf="state === 'state2'"></map-marker>
               </map-marker-clusterer>
             </google-map>`,
})
class TestApp {
  @ViewChild(MapMarkerClusterer) markerClusterer: MapMarkerClusterer;

  ariaLabelFn?: AriaLabelFn;
  averageCenter?: boolean;
  batchSize?: number;
  batchSizeIE?: number;
  calculator?: Calculator;
  clusterClass?: string;
  enableRetinalIcons?: boolean;
  gridSize?: number;
  ignoreHidden?: boolean;
  imageExtension?: string;
  imagePath?: string;
  imageSizes?: number[];
  maxZoom?: number;
  minimumClusterSize?: number;
  styles?: ClusterIconStyle[];
  title?: string;
  zIndex?: number;
  zoomOnClick?: boolean;

  state = 'state1';

  onClusteringBegin() {}
}
