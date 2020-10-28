/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
  Inject,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, shareReplay, take, takeUntil} from 'rxjs/operators';
import {MapEventManager} from '../map-event-manager';

interface GoogleMapsWindow extends Window {
  google?: typeof google;
}

/** default options set to the Googleplex */
export const DEFAULT_OPTIONS: google.maps.MapOptions = {
  center: {lat: 37.421995, lng: -122.084092},
  zoom: 17
};

/** Arbitrary default height for the map element */
export const DEFAULT_HEIGHT = '500px';
/** Arbitrary default width for the map element */
export const DEFAULT_WIDTH = '500px';

/**
 * Angular component that renders a Google Map via the Google Maps JavaScript
 * API.
 * @see https://developers.google.com/maps/documentation/javascript/reference/
 */
@Component({
  selector: 'google-map',
  exportAs: 'googleMap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="map-container"></div><ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
})
export class GoogleMap implements OnChanges, OnInit, OnDestroy {
  private _eventManager: MapEventManager = new MapEventManager(this._ngZone);
  private _googleMapChanges: Observable<google.maps.Map>;

  private readonly _options = new BehaviorSubject<google.maps.MapOptions>(DEFAULT_OPTIONS);
  private readonly _center =
      new BehaviorSubject<google.maps.LatLngLiteral|google.maps.LatLng|undefined>(undefined);
  private readonly _zoom = new BehaviorSubject<number|undefined>(undefined);
  private readonly _destroy = new Subject<void>();
  private _mapEl: HTMLElement;

  /**
   * The underlying google.maps.Map object
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#Map
   */
  googleMap?: google.maps.Map;

  /** Whether we're currently rendering inside a browser. */
  _isBrowser: boolean;

  /** Height of the map. Set this to `null` if you'd like to control the height through CSS. */
  @Input() height: string | number | null = DEFAULT_HEIGHT;

  /** Width of the map. Set this to `null` if you'd like to control the width through CSS. */
  @Input() width: string | number | null = DEFAULT_WIDTH;

  /**
   * Type of map that should be rendered. E.g. hybrid map, terrain map etc.
   * See: https://developers.google.com/maps/documentation/javascript/reference/map#MapTypeId
   */
  @Input() mapTypeId: google.maps.MapTypeId | undefined;

  @Input()
  set center(center: google.maps.LatLngLiteral|google.maps.LatLng) {
    this._center.next(center);
  }
  @Input()
  set zoom(zoom: number) {
    this._zoom.next(zoom);
  }
  @Input()
  set options(options: google.maps.MapOptions) {
    this._options.next(options || DEFAULT_OPTIONS);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.bounds_changed
   */
  @Output()
  boundsChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('bounds_changed');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.center_changed
   */
  @Output()
  centerChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('center_changed');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.click
   */
  @Output()
  mapClick: Observable<google.maps.MouseEvent|google.maps.IconMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent|google.maps.IconMouseEvent>('click');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.dblclick
   */
  @Output()
  mapDblclick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dblclick');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.drag
   */
  @Output() mapDrag: Observable<void> = this._eventManager.getLazyEmitter<void>('drag');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.dragend
   */
  @Output() mapDragend: Observable<void> = this._eventManager.getLazyEmitter<void>('dragend');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.dragstart
   */
  @Output() mapDragstart: Observable<void> = this._eventManager.getLazyEmitter<void>('dragstart');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.heading_changed
   */
  @Output()
  headingChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('heading_changed');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.idle
   */
  @Output() idle: Observable<void> = this._eventManager.getLazyEmitter<void>('idle');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.maptypeid_changed
   */
  @Output()
  maptypeidChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('maptypeid_changed');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mousemove
   */
  @Output()
  mapMousemove: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mousemove');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mouseout
   */
  @Output()
  mapMouseout: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseout');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mouseover
   */
  @Output()
  mapMouseover: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseover');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/map#Map.projection_changed
   */
  @Output()
  projectionChanged: Observable<void> =
      this._eventManager.getLazyEmitter<void>('projection_changed');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.rightclick
   */
  @Output()
  mapRightclick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('rightclick');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.tilesloaded
   */
  @Output() tilesloaded: Observable<void> = this._eventManager.getLazyEmitter<void>('tilesloaded');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.tilt_changed
   */
  @Output() tiltChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('tilt_changed');

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.zoom_changed
   */
  @Output() zoomChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('zoom_changed');

  constructor(
    private readonly _elementRef: ElementRef,
    private _ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object) {

    this._isBrowser = isPlatformBrowser(platformId);

    if (this._isBrowser) {
      const googleMapsWindow: GoogleMapsWindow = window;
      if (!googleMapsWindow.google && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw Error(
            'Namespace google not found, cannot construct embedded google ' +
            'map. Please install the Google Maps JavaScript API: ' +
            'https://developers.google.com/maps/documentation/javascript/' +
            'tutorial#Loading_the_Maps_API');
      }
    }
  }

  ngOnChanges() {
    this._setSize();
    if (this.googleMap && this.mapTypeId) {
      this.googleMap.setMapTypeId(this.mapTypeId);
    }
  }

  ngOnInit() {
    // It should be a noop during server-side rendering.
    if (this._isBrowser) {
      this._mapEl = this._elementRef.nativeElement.querySelector('.map-container')!;
      this._setSize();
      this._googleMapChanges = this._initializeMap(this._combineOptions());
      this._googleMapChanges.subscribe((googleMap: google.maps.Map) => {
        this.googleMap = googleMap;
        this._eventManager.setTarget(this.googleMap);
      });

      this._watchForOptionsChanges();
      this._watchForCenterChanges();
      this._watchForZoomChanges();
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroy.next();
    this._destroy.complete();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.fitBounds
   */
  fitBounds(
      bounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral,
      padding?: number|google.maps.Padding) {
    this._assertInitialized();
    this.googleMap.fitBounds(bounds, padding);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panBy
   */
  panBy(x: number, y: number) {
    this._assertInitialized();
    this.googleMap.panBy(x, y);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panTo
   */
  panTo(latLng: google.maps.LatLng|google.maps.LatLngLiteral) {
    this._assertInitialized();
    this.googleMap.panTo(latLng);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panToBounds
   */
  panToBounds(
      latLngBounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral,
      padding?: number|google.maps.Padding) {
    this._assertInitialized();
    this.googleMap.panToBounds(latLngBounds, padding);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getBounds
   */
  getBounds(): google.maps.LatLngBounds|null {
    this._assertInitialized();
    return this.googleMap.getBounds() || null;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getCenter
   */
  getCenter(): google.maps.LatLng {
    this._assertInitialized();
    return this.googleMap.getCenter();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getClickableIcons
   */
  getClickableIcons(): boolean {
    this._assertInitialized();
    return this.googleMap.getClickableIcons();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getHeading
   */
  getHeading(): number {
    this._assertInitialized();
    return this.googleMap.getHeading();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getMapTypeId
   */
  getMapTypeId(): google.maps.MapTypeId|string {
    this._assertInitialized();
    return this.googleMap.getMapTypeId();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getProjection
   */
  getProjection(): google.maps.Projection|null {
    this._assertInitialized();
    return this.googleMap.getProjection();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getStreetView
   */
  getStreetView(): google.maps.StreetViewPanorama {
    this._assertInitialized();
    return this.googleMap.getStreetView();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getTilt
   */
  getTilt(): number {
    this._assertInitialized();
    return this.googleMap.getTilt();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getZoom
   */
  getZoom(): number {
    this._assertInitialized();
    return this.googleMap.getZoom();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.controls
   */
  get controls(): google.maps.MVCArray<Node>[] {
    this._assertInitialized();
    return this.googleMap.controls;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.data
   */
  get data(): google.maps.Data {
    this._assertInitialized();
    return this.googleMap.data;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mapTypes
   */
  get mapTypes(): google.maps.MapTypeRegistry {
    this._assertInitialized();
    return this.googleMap.mapTypes;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.overlayMapTypes
   */
  get overlayMapTypes(): google.maps.MVCArray<google.maps.MapType> {
    this._assertInitialized();
    return this.googleMap.overlayMapTypes;
  }

  private _setSize() {
    if (this._mapEl) {
      const styles = this._mapEl.style;
      styles.height =
          this.height === null ? '' : (coerceCssPixelValue(this.height) || DEFAULT_HEIGHT);
      styles.width = this.width === null ? '' : (coerceCssPixelValue(this.width) || DEFAULT_WIDTH);
    }
  }

  /** Combines the center and zoom and the other map options into a single object */
  private _combineOptions(): Observable<google.maps.MapOptions> {
    return combineLatest([this._options, this._center, this._zoom])
        .pipe(map(([options, center, zoom]) => {
          const combinedOptions: google.maps.MapOptions = {
            ...options,
            // It's important that we set **some** kind of `center` and `zoom`, otherwise
            // Google Maps will render a blank rectangle which looks broken.
            center: center || options.center || DEFAULT_OPTIONS.center,
            zoom: zoom ?? options.zoom ?? DEFAULT_OPTIONS.zoom,
            mapTypeId: this.mapTypeId
          };
          return combinedOptions;
        }));
  }

  private _initializeMap(optionsChanges: Observable<google.maps.MapOptions>):
      Observable<google.maps.Map> {
    return optionsChanges.pipe(
        take(1),
        map(options => {
          // Create the object outside the zone so its events don't trigger change detection.
          // We'll bring it back in inside the `MapEventManager` only for the events that the
          // user has subscribed to.
          return this._ngZone.runOutsideAngular(() => new google.maps.Map(this._mapEl, options));
        }),
        shareReplay(1));
  }

  private _watchForOptionsChanges() {
    combineLatest([this._googleMapChanges, this._options])
        .pipe(takeUntil(this._destroy))
        .subscribe(([googleMap, options]) => {
          googleMap.setOptions(options);
        });
  }

  private _watchForCenterChanges() {
    combineLatest([this._googleMapChanges, this._center])
        .pipe(takeUntil(this._destroy))
        .subscribe(([googleMap, center]) => {
          if (center) {
            googleMap.setCenter(center);
          }
        });
  }

  private _watchForZoomChanges() {
    combineLatest([this._googleMapChanges, this._zoom])
        .pipe(takeUntil(this._destroy))
        .subscribe(([googleMap, zoom]) => {
          if (zoom !== undefined) {
            googleMap.setZoom(zoom);
          }
        });
  }

  /** Asserts that the map has been initialized. */
  private _assertInitialized(): asserts this is {googleMap: google.maps.Map} {
    if (!this.googleMap && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Cannot access Google Map information before the API has been initialized. ' +
                  'Please wait for the API to load before trying to interact with it.');
    }
  }
}

const cssUnitsPattern = /([A-Za-z%]+)$/;

/** Coerces a value to a CSS pixel value. */
function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return cssUnitsPattern.test(value) ? value : `${value}px`;
}
