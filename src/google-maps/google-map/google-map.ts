/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, shareReplay, take, takeUntil} from 'rxjs/operators';

import {MapMarker} from '../map-marker/map-marker';

interface GoogleMapsWindow extends Window {
  google?: typeof google;
}

// TODO(mbehrlich): Update this to use original map after updating DefinitelyTyped
/**
 * Extends the Google Map interface due to the Definitely Typed implementation
 * missing "getClickableIcons".
 */
export interface UpdatedGoogleMap extends google.maps.Map {
  getClickableIcons: () => boolean;
}

/** default options set to the Googleplex */
export const DEFAULT_OPTIONS: google.maps.MapOptions = {
  center: {lat: 37.421995, lng: -122.084092},
  zoom: 17,
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
  moduleId: module.id,
  selector: 'google-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<div class="map-container"></div><ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
})
export class GoogleMap implements OnChanges, OnInit, AfterContentInit, OnDestroy {
  @Input() height = DEFAULT_HEIGHT;

  @Input() width = DEFAULT_WIDTH;

  @Input()
  set center(center: google.maps.LatLngLiteral) {
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
  @Output() boundsChanged = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.center_changed
   */
  @Output() centerChanged = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.click
   */
  @Output() mapClick = new EventEmitter<google.maps.MouseEvent|google.maps.IconMouseEvent>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.dblclick
   */
  @Output() mapDblclick = new EventEmitter<google.maps.MouseEvent>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.drag
   */
  @Output() mapDrag = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.dragend
   */
  @Output() mapDragend = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.dragstart
   */
  @Output() mapDragstart = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.heading_changed
   */
  @Output() headingChanged = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.idle
   */
  @Output() idle = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.maptypeid_changed
   */
  @Output() maptypeidChanged = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mousemove
   */
  @Output() mapMousemove = new EventEmitter<google.maps.MouseEvent>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mouseout
   */
  @Output() mapMouseout = new EventEmitter<google.maps.MouseEvent>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mouseover
   */
  @Output() mapMouseover = new EventEmitter<google.maps.MouseEvent>();

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/map#Map.projection_changed
   */
  @Output() projectionChanged = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.rightclick
   */
  @Output() mapRightclick = new EventEmitter<google.maps.MouseEvent>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.tilesloaded
   */
  @Output() tilesloaded = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.tilt_changed
   */
  @Output() tiltChanged = new EventEmitter<void>();

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.zoom_changed
   */
  @Output() zoomChanged = new EventEmitter<void>();

  @ContentChildren(MapMarker) _markers: QueryList<MapMarker>;

  private _mapEl: HTMLElement;
  _googleMap!: UpdatedGoogleMap;

  private _googleMapChanges!: Observable<google.maps.Map>;

  private readonly _listeners: google.maps.MapsEventListener[] = [];

  private readonly _options = new BehaviorSubject<google.maps.MapOptions>(DEFAULT_OPTIONS);
  private readonly _center = new BehaviorSubject<google.maps.LatLngLiteral|undefined>(undefined);
  private readonly _zoom = new BehaviorSubject<number|undefined>(undefined);

  private readonly _destroy = new Subject<void>();

  constructor(private readonly _elementRef: ElementRef) {
    const googleMapsWindow: GoogleMapsWindow = window;
    if (!googleMapsWindow.google) {
      throw Error(
          'Namespace google not found, cannot construct embedded google ' +
          'map. Please install the Google Maps JavaScript API: ' +
          'https://developers.google.com/maps/documentation/javascript/' +
          'tutorial#Loading_the_Maps_API');
    }
  }

  ngOnChanges() {
    this._setSize();
  }

  ngOnInit() {
    this._mapEl = this._elementRef.nativeElement.querySelector('.map-container')!;
    this._setSize();

    const combinedOptionsChanges = this._combineOptions();

    this._googleMapChanges = this._initializeMap(combinedOptionsChanges);
    this._googleMapChanges.subscribe((googleMap: google.maps.Map) => {
      this._googleMap = googleMap as UpdatedGoogleMap;

      this._initializeEventHandlers();
    });

    this._watchForOptionsChanges(combinedOptionsChanges);
  }

  ngAfterContentInit() {
    for (const marker of this._markers.toArray()) {
      marker._setMap(this._googleMap);
    }
    this._watchForMarkerChanges();
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    for (let listener of this._listeners) {
      listener.remove();
    }
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.fitBounds
   */
  fitBounds(
      bounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral,
      padding?: number|google.maps.Padding) {
    this._googleMap.fitBounds(bounds, padding);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panBy
   */
  panBy(x: number, y: number) {
    this._googleMap.panBy(x, y);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panTo
   */
  panTo(latLng: google.maps.LatLng|google.maps.LatLngLiteral) {
    this._googleMap.panTo(latLng);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.panToBounds
   */
  panToBounds(
      latLngBounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral,
      padding?: number|google.maps.Padding) {
    this._googleMap.panToBounds(latLngBounds, padding);
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getBounds
   */
  getBounds(): google.maps.LatLngBounds|null {
    return this._googleMap.getBounds() || null;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getCenter
   */
  getCenter(): google.maps.LatLng {
    return this._googleMap.getCenter();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getClickableIcons
   */
  getClickableIcons(): boolean {
    return this._googleMap.getClickableIcons();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getHeading
   */
  getHeading(): number {
    return this._googleMap.getHeading();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getMapTypeId
   */
  getMapTypeId(): google.maps.MapTypeId|string {
    return this._googleMap.getMapTypeId();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getProjection
   */
  getProjection(): google.maps.Projection|null {
    return this._googleMap.getProjection();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getStreetView
   */
  getStreetView(): google.maps.StreetViewPanorama {
    return this._googleMap.getStreetView();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getTilt
   */
  getTilt(): number {
    return this._googleMap.getTilt();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.getZoom
   */
  getZoom(): number {
    return this._googleMap.getZoom();
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.controls
   */
  get controls(): Array<google.maps.MVCArray<Node>> {
    return this._googleMap.controls;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.data
   */
  get data(): google.maps.Data {
    return this._googleMap.data;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.mapTypes
   */
  get mapTypes(): google.maps.MapTypeRegistry {
    return this._googleMap.mapTypes;
  }

  /**
   * See
   * https://developers.google.com/maps/documentation/javascript/reference/map#Map.overlayMapTypes
   */
  get overlayMapTypes(): google.maps.MVCArray<google.maps.MapType> {
    return this._googleMap.overlayMapTypes;
  }

  private _setSize() {
    if (this._mapEl) {
      this._mapEl.style.height = this.height || DEFAULT_HEIGHT;
      this._mapEl.style.width = this.width || DEFAULT_WIDTH;
    }
  }

  /** Combines the center and zoom and the other map options into a single object */
  private _combineOptions(): Observable<google.maps.MapOptions> {
    return combineLatest(this._options, this._center, this._zoom)
        .pipe(map(([options, center, zoom]) => {
          const combinedOptions: google.maps.MapOptions = {
            ...options,
            center: center || options.center,
            zoom: zoom !== undefined ? zoom : options.zoom,
          };
          return combinedOptions;
        }));
  }

  private _initializeMap(optionsChanges: Observable<google.maps.MapOptions>):
      Observable<google.maps.Map> {
    return optionsChanges.pipe(
        take(1), map(options => {
          return new google.maps.Map(this._mapEl, options);
        }),
        shareReplay(1));
  }

  private _watchForOptionsChanges(
      optionsChanges: Observable<google.maps.MapOptions>) {
    combineLatest(this._googleMapChanges, optionsChanges)
        .pipe(takeUntil(this._destroy))
        .subscribe(([googleMap, options]) => {
          googleMap.setOptions(options);
        });
  }

  private _initializeEventHandlers() {
    const eventHandlers = new Map<string, EventEmitter<void>>([
      ['bounds_changed', this.boundsChanged],
      ['center_changed', this.centerChanged],
      ['drag', this.mapDrag],
      ['dragend', this.mapDragend],
      ['dragstart', this.mapDragstart],
      ['heading_changed', this.headingChanged],
      ['idle', this.idle],
      ['maptypeid_changed', this.maptypeidChanged],
      ['projection_changed', this.projectionChanged],
      ['tilesloaded', this.tilesloaded],
      ['tilt_changed', this.tiltChanged],
      ['zoomChanged', this.zoomChanged],
    ]);
    const mouseEventHandlers = new Map<string, EventEmitter<google.maps.MouseEvent>>([
      ['dblclick', this.mapDblclick],
      ['mousemove', this.mapMousemove],
      ['mouseout', this.mapMouseout],
      ['mouseover', this.mapMouseover],
      ['rightclick', this.mapRightclick],
    ]);
    eventHandlers.forEach((eventHandler: EventEmitter<void>, name: string) => {
      if (eventHandler.observers.length > 0) {
        this._listeners.push(this._googleMap.addListener(name, () => {
          eventHandler.emit();
        }));
      }
    });
    mouseEventHandlers.forEach(
        (eventHandler: EventEmitter<google.maps.MouseEvent>, name: string) => {
          if (eventHandler.observers.length > 0) {
            this._listeners.push(
                this._googleMap.addListener(name, (event: google.maps.MouseEvent) => {
                  eventHandler.emit(event);
                }));
          }
        });
    if (this.mapClick.observers.length > 0) {
      this._listeners.push(this._googleMap.addListener(
          'click', (event: google.maps.MouseEvent|google.maps.IconMouseEvent) => {
            this.mapClick.emit(event);
          }));
    }
  }

  private _watchForMarkerChanges() {
    combineLatest(this._googleMapChanges, this._markers.changes)
        .pipe(takeUntil(this._destroy))
        .subscribe(([googleMap, markers]) => {
          for (let marker of markers) {
            marker._setMap(googleMap);
          }
        });
  }
}
