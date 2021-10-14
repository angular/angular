/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {Directive, Input, OnDestroy, OnInit, Output, NgZone} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Rectangle via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle
 */
@Directive({
  selector: 'map-rectangle',
  exportAs: 'mapRectangle',
})
export class MapRectangle implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager(this._ngZone);
  private readonly _options = new BehaviorSubject<google.maps.RectangleOptions>({});
  private readonly _bounds = new BehaviorSubject<
    google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral | undefined
  >(undefined);

  private readonly _destroyed = new Subject<void>();

  /**
   * The underlying google.maps.Rectangle object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle
   */
  rectangle?: google.maps.Rectangle;

  @Input()
  set options(options: google.maps.RectangleOptions) {
    this._options.next(options || {});
  }

  @Input()
  set bounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) {
    this._bounds.next(bounds);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.boundsChanged
   */ @Output() readonly boundsChanged: Observable<void> =
    this._eventManager.getLazyEmitter<void>('bounds_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.click
   */
  @Output() readonly rectangleClick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('click');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.dblclick
   */
  @Output() readonly rectangleDblclick: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dblclick');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.drag
   */
  @Output() readonly rectangleDrag: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('drag');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.dragend
   */
  @Output() readonly rectangleDragend: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragend');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.dragstart
   */
  @Output() readonly rectangleDragstart: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('dragstart');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mousedown
   */
  @Output() readonly rectangleMousedown: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mousedown');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mousemove
   */
  @Output() readonly rectangleMousemove: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mousemove');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mouseout
   */
  @Output() readonly rectangleMouseout: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mouseout');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mouseover
   */
  @Output() readonly rectangleMouseover: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mouseover');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mouseup
   */
  @Output() readonly rectangleMouseup: Observable<google.maps.MapMouseEvent> =
    this._eventManager.getLazyEmitter<google.maps.MapMouseEvent>('mouseup');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.rightclick
   */
  @Output() readonly rectangleRightclick: Observable<google.maps.MapMouseEvent> =
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
            this.rectangle = new google.maps.Rectangle(options);
          });
          this._assertInitialized();
          this.rectangle.setMap(this._map.googleMap!);
          this._eventManager.setTarget(this.rectangle);
        });

      this._watchForOptionsChanges();
      this._watchForBoundsChanges();
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    if (this.rectangle) {
      this.rectangle.setMap(null);
    }
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getBounds
   */
  getBounds(): google.maps.LatLngBounds | null {
    this._assertInitialized();
    return this.rectangle.getBounds();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getDraggable
   */
  getDraggable(): boolean {
    this._assertInitialized();
    return this.rectangle.getDraggable();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getEditable
   */
  getEditable(): boolean {
    this._assertInitialized();
    return this.rectangle.getEditable();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getVisible
   */
  getVisible(): boolean {
    this._assertInitialized();
    return this.rectangle.getVisible();
  }

  private _combineOptions(): Observable<google.maps.RectangleOptions> {
    return combineLatest([this._options, this._bounds]).pipe(
      map(([options, bounds]) => {
        const combinedOptions: google.maps.RectangleOptions = {
          ...options,
          bounds: bounds || options.bounds,
        };
        return combinedOptions;
      }),
    );
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe(options => {
      this._assertInitialized();
      this.rectangle.setOptions(options);
    });
  }

  private _watchForBoundsChanges() {
    this._bounds.pipe(takeUntil(this._destroyed)).subscribe(bounds => {
      if (bounds) {
        this._assertInitialized();
        this.rectangle.setBounds(bounds);
      }
    });
  }

  private _assertInitialized(): asserts this is {rectangle: google.maps.Rectangle} {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._map.googleMap) {
        throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
            'Please wait for the API to load before trying to interact with it.',
        );
      }
      if (!this.rectangle) {
        throw Error(
          'Cannot interact with a Google Map Rectangle before it has been initialized. ' +
            'Please wait for the Rectangle to load before trying to interact with it.',
        );
      }
    }
  }
}
