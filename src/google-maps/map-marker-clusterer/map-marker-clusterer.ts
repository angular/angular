/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />
/// <reference path="marker-clusterer-types.ts" />

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';
import {MapMarker} from '../map-marker/map-marker';

/**
 * Angular component for implementing a Google Maps Marker Clusterer.
 *
 * See https://developers.google.com/maps/documentation/javascript/marker-clustering
 */
@Component({
  selector: 'map-marker-clusterer',
  exportAs: 'mapMarkerClusterer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
})
export class MapMarkerClusterer implements OnInit, AfterContentInit, OnDestroy {
  private readonly _ariaLabelFn = new BehaviorSubject<AriaLabelFn|undefined>(undefined);
  private readonly _averageCenter = new BehaviorSubject<boolean|undefined>(undefined);
  private readonly _batchSizeIE = new BehaviorSubject<number|undefined>(undefined);
  private readonly _calculator = new BehaviorSubject<Calculator|undefined>(undefined);
  private readonly _clusterClass = new BehaviorSubject<string|undefined>(undefined);
  private readonly _enableRetinalIcons = new BehaviorSubject<boolean|undefined>(undefined);
  private readonly _gridSize = new BehaviorSubject<number|undefined>(undefined);
  private readonly _ignoreHidden = new BehaviorSubject<boolean|undefined>(undefined);
  private readonly _imageExtension = new BehaviorSubject<string|undefined>(undefined);
  private readonly _imagePath = new BehaviorSubject<string|undefined>(undefined);
  private readonly _imageSizes = new BehaviorSubject<number[]|undefined>(undefined);
  private readonly _maxZoom = new BehaviorSubject<number|undefined>(undefined);
  private readonly _minimumClusterSize = new BehaviorSubject<number|undefined>(undefined);
  private readonly _styles = new BehaviorSubject<ClusterIconStyle[]|undefined>(undefined);
  private readonly _title = new BehaviorSubject<string|undefined>(undefined);
  private readonly _zIndex = new BehaviorSubject<number|undefined>(undefined);
  private readonly _zoomOnClick = new BehaviorSubject<boolean|undefined>(undefined);

  private readonly _currentMarkers = new Set<google.maps.Marker>();

  private readonly _eventManager = new MapEventManager(this._ngZone);
  private readonly _destroy = new Subject<void>();

  /** Whether the clusterer is allowed to be initialized. */
  private readonly _canInitialize: boolean;

  @Input()
  get ariaLabelFn(): AriaLabelFn {
    return this.markerClusterer ? this.markerClusterer.ariaLabelFn : () => '';
  }
  set ariaLabelFn(ariaLabelFn: AriaLabelFn) {
    this._ariaLabelFn.next(ariaLabelFn);
  }

  @Input()
  set averageCenter(averageCenter: boolean) {
    this._averageCenter.next(averageCenter);
  }

  @Input() batchSize?: number;

  @Input()
  set batchSizeIE(batchSizeIE: number) {
    this._batchSizeIE.next(batchSizeIE);
  }

  @Input()
  set calculator(calculator: Calculator) {
    this._calculator.next(calculator);
  }

  @Input()
  set clusterClass(clusterClass: string) {
    this._clusterClass.next(clusterClass);
  }

  @Input()
  set enableRetinalIcons(enableRetinalIcons: boolean) {
    this._enableRetinalIcons.next(enableRetinalIcons);
  }

  @Input()
  set gridSize(gridSize: number) {
    this._gridSize.next(gridSize);
  }

  @Input()
  set ignoreHidden(ignoreHidden: boolean) {
    this._ignoreHidden.next(ignoreHidden);
  }

  @Input()
  set imageExtension(imageExtension: string) {
    this._imageExtension.next(imageExtension);
  }

  @Input()
  set imagePath(imagePath: string) {
    this._imagePath.next(imagePath);
  }

  @Input()
  set imageSizes(imageSizes: number[]) {
    this._imageSizes.next(imageSizes);
  }

  @Input()
  set maxZoom(maxZoom: number) {
    this._maxZoom.next(maxZoom);
  }

  @Input()
  set minimumClusterSize(minimumClusterSize: number) {
    this._minimumClusterSize.next(minimumClusterSize);
  }

  @Input()
  set styles(styles: ClusterIconStyle[]) {
    this._styles.next(styles);
  }

  @Input()
  set title(title: string) {
    this._title.next(title);
  }

  @Input()
  set zIndex(zIndex: number) {
    this._zIndex.next(zIndex);
  }

  @Input()
  set zoomOnClick(zoomOnClick: boolean) {
    this._zoomOnClick.next(zoomOnClick);
  }

  /**
   * See
   * googlemaps.github.io/v3-utility-library/modules/
   * _google_markerclustererplus.html#clusteringbegin
   */
  @Output()
  clusteringbegin: Observable<void> = this._eventManager.getLazyEmitter<void>('clusteringbegin');

  /**
   * See
   * googlemaps.github.io/v3-utility-library/modules/_google_markerclustererplus.html#clusteringend
   */
  @Output()
  clusteringend: Observable<void> = this._eventManager.getLazyEmitter<void>('clusteringend');

  @ContentChildren(MapMarker, {descendants: true}) _markers: QueryList<MapMarker>;

  /**
   * The underlying MarkerClusterer object.
   *
   * See
   * googlemaps.github.io/v3-utility-library/classes/
   * _google_markerclustererplus.markerclusterer.html
   */
  markerClusterer?: MarkerClusterer;

  constructor(private readonly _googleMap: GoogleMap, private readonly _ngZone: NgZone) {
    this._canInitialize = this._googleMap._isBrowser;
  }

  ngOnInit() {
    if (this._canInitialize) {
      this._combineOptions().pipe(take(1)).subscribe(options => {
        // Create the object outside the zone so its events don't trigger change detection.
        // We'll bring it back in inside the `MapEventManager` only for the events that the
        // user has subscribed to.
        this._ngZone.runOutsideAngular(() => {
          this.markerClusterer = new MarkerClusterer(this._googleMap.googleMap!, [], options);
        });

        this._assertInitialized();
        this._eventManager.setTarget(this.markerClusterer);
      });

      this._watchForAriaLabelFnChanges();
      this._watchForAverageCenterChanges();
      this._watchForBatchSizeIEChanges();
      this._watchForCalculatorChanges();
      this._watchForClusterClassChanges();
      this._watchForEnableRetinalIconsChanges();
      this._watchForGridSizeChanges();
      this._watchForIgnoreHiddenChanges();
      this._watchForImageExtensionChanges();
      this._watchForImagePathChanges();
      this._watchForImageSizesChanges();
      this._watchForMaxZoomChanges();
      this._watchForMinimumClusterSizeChanges();
      this._watchForStylesChanges();
      this._watchForTitleChanges();
      this._watchForZIndexChanges();
      this._watchForZoomOnClickChanges();
    }
  }

  ngAfterContentInit() {
    if (this._canInitialize) {
      this._watchForMarkerChanges();
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this._eventManager.destroy();
    if (this.markerClusterer) {
      this.markerClusterer.setMap(null);
    }
  }

  fitMapToMarkers(padding: number|google.maps.Padding) {
    this._assertInitialized();
    this.markerClusterer.fitMapToMarkers(padding);
  }

  getAverageCenter(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getAverageCenter();
  }

  getBatchSizeIE(): number {
    this._assertInitialized();
    return this.markerClusterer.getBatchSizeIE();
  }

  getCalculator(): Calculator {
    this._assertInitialized();
    return this.markerClusterer.getCalculator();
  }

  getClusterClass(): string {
    this._assertInitialized();
    return this.markerClusterer.getClusterClass();
  }

  getClusters(): Cluster[] {
    this._assertInitialized();
    return this.markerClusterer.getClusters();
  }

  getEnableRetinalIcons(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getEnableRetinalIcons();
  }

  getGridSize(): number {
    this._assertInitialized();
    return this.markerClusterer.getGridSize();
  }

  getIgnoreHidden(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getIgnoreHidden();
  }

  getImageExtension(): string {
    this._assertInitialized();
    return this.markerClusterer.getImageExtension();
  }

  getImagePath(): string {
    this._assertInitialized();
    return this.markerClusterer.getImagePath();
  }

  getImageSizes(): number[] {
    this._assertInitialized();
    return this.markerClusterer.getImageSizes();
  }

  getMaxZoom(): number {
    this._assertInitialized();
    return this.markerClusterer.getMaxZoom();
  }

  getMinimumClusterSize(): number {
    this._assertInitialized();
    return this.markerClusterer.getMinimumClusterSize();
  }

  getStyles(): ClusterIconStyle[] {
    this._assertInitialized();
    return this.markerClusterer.getStyles();
  }

  getTitle(): string {
    this._assertInitialized();
    return this.markerClusterer.getTitle();
  }

  getTotalClusters(): number {
    this._assertInitialized();
    return this.markerClusterer.getTotalClusters();
  }

  getTotalMarkers(): number {
    this._assertInitialized();
    return this.markerClusterer.getTotalMarkers();
  }

  getZIndex(): number {
    this._assertInitialized();
    return this.markerClusterer.getZIndex();
  }

  getZoomOnClick(): boolean {
    this._assertInitialized();
    return this.markerClusterer.getZoomOnClick();
  }

  private _combineOptions(): Observable<MarkerClustererOptions> {
    return combineLatest([
      this._ariaLabelFn,
      this._averageCenter,
      this._batchSizeIE,
      this._calculator,
      this._clusterClass,
      this._enableRetinalIcons,
      this._gridSize,
      this._ignoreHidden,
      this._imageExtension,
      this._imagePath,
      this._imageSizes,
      this._maxZoom,
      this._minimumClusterSize,
      this._styles,
      this._title,
      this._zIndex,
      this._zoomOnClick,
    ]).pipe(take(1), map(([
      ariaLabelFn,
      averageCenter,
      batchSizeIE,
      calculator,
      clusterClass,
      enableRetinalIcons,
      gridSize,
      ignoreHidden,
      imageExtension,
      imagePath,
      imageSizes,
      maxZoom,
      minimumClusterSize,
      styles,
      title,
      zIndex,
      zoomOnClick,
    ]) => {
      const combinedOptions: MarkerClustererOptions = {
        ariaLabelFn: ariaLabelFn as AriaLabelFn|undefined,
        averageCenter: averageCenter as boolean|undefined,
        batchSize: this.batchSize,
        batchSizeIE: batchSizeIE as number|undefined,
        calculator: calculator as Calculator|undefined,
        clusterClass: clusterClass as string|undefined,
        enableRetinalIcons: enableRetinalIcons as boolean|undefined,
        gridSize: gridSize as number|undefined,
        ignoreHidden: ignoreHidden as boolean|undefined,
        imageExtension: imageExtension as string|undefined,
        imagePath: imagePath as string|undefined,
        imageSizes: imageSizes as number[]|undefined,
        maxZoom: maxZoom as number|undefined,
        minimumClusterSize: minimumClusterSize as number|undefined,
        styles: styles as ClusterIconStyle[]|undefined,
        title: title as string|undefined,
        zIndex: zIndex as number|undefined,
        zoomOnClick: zoomOnClick as boolean|undefined,
      };
      return combinedOptions;
    }));
  }

  private _watchForAriaLabelFnChanges() {
    this._ariaLabelFn.pipe(takeUntil(this._destroy)).subscribe(ariaLabelFn => {
      if (this.markerClusterer && ariaLabelFn) {
        this._assertInitialized();
        this.markerClusterer.ariaLabelFn = ariaLabelFn;
      }
    });
  }

  private _watchForAverageCenterChanges() {
    this._averageCenter.pipe(takeUntil(this._destroy)).subscribe(averageCenter => {
      if (this.markerClusterer && averageCenter !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setAverageCenter(averageCenter);
      }
    });
  }

  private _watchForBatchSizeIEChanges() {
    this._batchSizeIE.pipe(takeUntil(this._destroy)).subscribe(batchSizeIE => {
      if (this.markerClusterer && batchSizeIE !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setBatchSizeIE(batchSizeIE);
      }
    });
  }

  private _watchForCalculatorChanges() {
    this._calculator.pipe(takeUntil(this._destroy)).subscribe(calculator => {
      if (this.markerClusterer && calculator) {
        this._assertInitialized();
        this.markerClusterer.setCalculator(calculator);
      }
    });
  }

  private _watchForClusterClassChanges() {
    this._clusterClass.pipe(takeUntil(this._destroy)).subscribe(clusterClass => {
      if (this.markerClusterer && clusterClass !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setClusterClass(clusterClass);
      }
    });
  }

  private _watchForEnableRetinalIconsChanges() {
    this._enableRetinalIcons.pipe(takeUntil(this._destroy)).subscribe(enableRetinalIcons => {
      if (this.markerClusterer && enableRetinalIcons !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setEnableRetinalIcons(enableRetinalIcons);
      }
    });
  }

  private _watchForGridSizeChanges() {
    this._gridSize.pipe(takeUntil(this._destroy)).subscribe(gridSize => {
      if (this.markerClusterer && gridSize !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setGridSize(gridSize);
      }
    });
  }

  private _watchForIgnoreHiddenChanges() {
    this._ignoreHidden.pipe(takeUntil(this._destroy)).subscribe(ignoreHidden => {
      if (this.markerClusterer && ignoreHidden !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setIgnoreHidden(ignoreHidden);
      }
    });
  }

  private _watchForImageExtensionChanges() {
    this._imageExtension.pipe(takeUntil(this._destroy)).subscribe(imageExtension => {
      if (this.markerClusterer && imageExtension !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setImageExtension(imageExtension);
      }
    });
  }

  private _watchForImagePathChanges() {
    this._imagePath.pipe(takeUntil(this._destroy)).subscribe(imagePath => {
      if (this.markerClusterer && imagePath !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setImagePath(imagePath);
      }
    });
  }

  private _watchForImageSizesChanges() {
    this._imageSizes.pipe(takeUntil(this._destroy)).subscribe(imageSizes => {
      if (this.markerClusterer && imageSizes) {
        this._assertInitialized();
        this.markerClusterer.setImageSizes(imageSizes);
      }
    });
  }

  private _watchForMaxZoomChanges() {
    this._maxZoom.pipe(takeUntil(this._destroy)).subscribe(maxZoom => {
      if (this.markerClusterer && maxZoom !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setMaxZoom(maxZoom);
      }
    });
  }

  private _watchForMinimumClusterSizeChanges() {
    this._minimumClusterSize.pipe(takeUntil(this._destroy)).subscribe(minimumClusterSize => {
      if (this.markerClusterer && minimumClusterSize !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setMinimumClusterSize(minimumClusterSize);
      }
    });
  }

  private _watchForStylesChanges() {
    this._styles.pipe(takeUntil(this._destroy)).subscribe(styles => {
      if (this.markerClusterer && styles) {
        this._assertInitialized();
        this.markerClusterer.setStyles(styles);
      }
    });
  }

  private _watchForTitleChanges() {
    this._title.pipe(takeUntil(this._destroy)).subscribe(title => {
      if (this.markerClusterer && title !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setTitle(title);
      }
    });
  }

  private _watchForZIndexChanges() {
    this._zIndex.pipe(takeUntil(this._destroy)).subscribe(zIndex => {
      if (this.markerClusterer && zIndex !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setZIndex(zIndex);
      }
    });
  }

  private _watchForZoomOnClickChanges() {
    this._zoomOnClick.pipe(takeUntil(this._destroy)).subscribe(zoomOnClick => {
      if (this.markerClusterer && zoomOnClick !== undefined) {
        this._assertInitialized();
        this.markerClusterer.setZoomOnClick(zoomOnClick);
      }
    });
  }

  private _watchForMarkerChanges() {
    this._assertInitialized();
    const initialMarkers: google.maps.Marker[] = [];
    for (const marker of this._getInternalMarkers(this._markers.toArray())) {
      this._currentMarkers.add(marker);
      initialMarkers.push(marker);
    }
    this.markerClusterer.addMarkers(initialMarkers);

    this._markers.changes.pipe(takeUntil(this._destroy)).subscribe(
      (markerComponents: MapMarker[]) => {
        this._assertInitialized();
        const newMarkers = new Set<google.maps.Marker>(this._getInternalMarkers(markerComponents));
        const markersToAdd: google.maps.Marker[] = [];
        const markersToRemove: google.maps.Marker[] = [];
        for (const marker of Array.from(newMarkers)) {
          if (!this._currentMarkers.has(marker)) {
            this._currentMarkers.add(marker);
            markersToAdd.push(marker);
          }
        }
        for (const marker of Array.from(this._currentMarkers)) {
          if (!newMarkers.has(marker)) {
            markersToRemove.push(marker);
          }
        }
        this.markerClusterer.addMarkers(markersToAdd, true);
        this.markerClusterer.removeMarkers(markersToRemove, true);
        this.markerClusterer.repaint();
        for (const marker of markersToRemove) {
          this._currentMarkers.delete(marker);
        }
    });
  }

  private _getInternalMarkers(markers: MapMarker[]): google.maps.Marker[] {
    return markers.filter(markerComponent => !!markerComponent.marker)
        .map(markerComponent => markerComponent.marker!);
  }

  private _assertInitialized(): asserts this is {markerClusterer: MarkerClusterer} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._googleMap.googleMap) {
        throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.');
      }
      if (!this.markerClusterer) {
        throw Error(
          'Cannot interact with a MarkerClusterer before it has been initialized. ' +
          'Please wait for the MarkerClusterer to load before trying to interact with it.');
      }
    }
  }
}
