/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {Directive, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Circle via the Google Maps JavaScript API.
 * @see developers.google.com/maps/documentation/javascript/reference/polygon#Circle
 */
@Directive({
  selector: 'map-circle',
  exportAs: 'mapCircle',
})
export class MapCircle implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager(this._ngZone);
  private readonly _options = new BehaviorSubject<google.maps.CircleOptions>({});
  private readonly _center = new BehaviorSubject<
    google.maps.LatLng | google.maps.LatLngLiteral | undefined
  >(undefined);
  private readonly _radius = new BehaviorSubject<number | undefined>(undefined);

  private readonly _destroyed = new Subject<void>();

  /**
   * Underlying google.maps.Circle object.
   *
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Circle
   */
  circle?: google.maps.Circle; // initialized in ngOnInit

  @Input()
  set options(options: google.maps.CircleOptions) {
    this._options.next(options || {});
  }

  @Input()
  set center(center: google.maps.LatLng | google.maps.LatLngLiteral) {
    this._center.next(center);
  }

  @Input()
  set radius(radius: number) {
    this._radius.next(radius);
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.center_changed
   */
  @Output() readonly centerChanged: Observable<void> =
    this._eventManager.getLazyEmitter<void>('center_changed');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.click
   */
  @Output() readonly circleClick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('click');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.dblclick
   */
  @Output() readonly circleDblclick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dblclick');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.drag
   */
  @Output() readonly circleDrag: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('drag');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.dragend
   */
  @Output() readonly circleDragend: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragend');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.dragstart
   */
  @Output() readonly circleDragstart: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragstart');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.mousedown
   */
  @Output() readonly circleMousedown: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mousedown');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.mousemove
   */
  @Output() readonly circleMousemove: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mousemove');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.mouseout
   */
  @Output() readonly circleMouseout: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mouseout');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.mouseover
   */
  @Output() readonly circleMouseover: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mouseover');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.mouseup
   */
  @Output() readonly circleMouseup: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mouseup');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.radius_changed
   */
  @Output() readonly radiusChanged: Observable<void> =
    this._eventManager.getLazyEmitter<void>('radius_changed');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.rightclick
   */
  @Output() readonly circleRightclick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('rightclick');

  constructor(private readonly _map: GoogleMap, private readonly _ngZone: NgZone) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions()
        .pipe(take(1))
        .subscribe(options => {
          // Create the object outside the zone so its events don't trigger change detection.
          // We'll bring it back in inside the `MapEventManager` only for the events that the
          // user has subscribed to.
          this._ngZone.runOutsideAngular(() => {
            this.circle = new google.maps.Circle(options);
          });
          this._assertInitialized();
          this.circle.setMap(this._map.googleMap!);
          this._eventManager.setTarget(this.circle);
        });

      this._watchForOptionsChanges();
      this._watchForCenterChanges();
      this._watchForRadiusChanges();
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    if (this.circle) {
      this.circle.setMap(null);
    }
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getBounds
   */
  getBounds(): google.maps.LatLngBounds | null {
    this._assertInitialized();
    return this.circle.getBounds();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getCenter
   */
  getCenter(): google.maps.LatLng | null {
    this._assertInitialized();
    return this.circle.getCenter();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getDraggable
   */
  getDraggable(): boolean {
    this._assertInitialized();
    return this.circle.getDraggable();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getEditable
   */
  getEditable(): boolean {
    this._assertInitialized();
    return this.circle.getEditable();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getRadius
   */
  getRadius(): number {
    this._assertInitialized();
    return this.circle.getRadius();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Circle.getVisible
   */
  getVisible(): boolean {
    this._assertInitialized();
    return this.circle.getVisible();
  }

  private _combineOptions(): Observable<google.maps.CircleOptions> {
    return combineLatest([this._options, this._center, this._radius]).pipe(
      map(([options, center, radius]) => {
        const combinedOptions: google.maps.CircleOptions = {
          ...options,
          center: center || options.center,
          radius: radius !== undefined ? radius : options.radius,
        };
        return combinedOptions;
      }),
    );
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe(options => {
      this._assertInitialized();
      this.circle.setOptions(options);
    });
  }

  private _watchForCenterChanges() {
    this._center.pipe(takeUntil(this._destroyed)).subscribe(center => {
      if (center) {
        this._assertInitialized();
        this.circle.setCenter(center);
      }
    });
  }

  private _watchForRadiusChanges() {
    this._radius.pipe(takeUntil(this._destroyed)).subscribe(radius => {
      if (radius !== undefined) {
        this._assertInitialized();
        this.circle.setRadius(radius);
      }
    });
  }

  private _assertInitialized(): asserts this is {circle: google.maps.Circle} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._map.googleMap) {
        throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
            'Please wait for the API to load before trying to interact with it.',
        );
      }
      if (!this.circle) {
        throw Error(
          'Cannot interact with a Google Map Circle before it has been ' +
            'initialized. Please wait for the Circle to load before trying to interact with it.',
        );
      }
    }
  }
}
