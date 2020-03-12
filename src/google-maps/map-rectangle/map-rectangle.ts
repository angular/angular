/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />

import {Directive, Input, OnDestroy, OnInit, Output, NgZone} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Rectangle via the Google Maps JavaScript API.
 * @see developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle
 */
@Directive({
  selector: 'map-rectangle',
})
export class MapRectangle implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager(this._ngZone);
  private readonly _options = new BehaviorSubject<google.maps.RectangleOptions>({});
  private readonly _bounds =
      new BehaviorSubject<google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral|undefined>(
          undefined);

  private readonly _destroyed = new Subject<void>();

  _rectangle: google.maps.Rectangle;  // initialized in ngOnInit

  @Input()
  set options(options: google.maps.RectangleOptions) {
    this._options.next(options || {});
  }

  @Input()
  set bounds(bounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral) {
    this._bounds.next(bounds);
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.boundsChanged
   */
  @Output()
  boundsChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('bounds_changed');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.click
   */
  @Output()
  rectangleClick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('click');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.dblclick
   */
  @Output()
  rectangleDblclick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dblclick');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.drag
   */
  @Output()
  rectangleDrag: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('drag');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.dragend
   */
  @Output()
  rectangleDragend: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dragend');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.dragstart
   */
  @Output()
  rectangleDragstart: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dragstart');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mousedown
   */
  @Output()
  rectangleMousedown: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mousedown');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mousemove
   */
  @Output()
  rectangleMousemove: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mousemove');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mouseout
   */
  @Output()
  rectangleMouseout: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseout');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mouseover
   */
  @Output()
  rectangleMouseover: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseover');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.mouseup
   */
  @Output()
  rectangleMouseup: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('mouseup');

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.rightclick
   */
  @Output()
  rectangleRightclick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('rightclick');

  constructor(private readonly _map: GoogleMap, private readonly _ngZone: NgZone) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe(options => {
        // Create the object outside the zone so its events don't trigger change detection.
        // We'll bring it back in inside the `MapEventManager` only for the events that the
        // user has subscribed to.
        this._ngZone.runOutsideAngular(() => {
          this._rectangle = new google.maps.Rectangle(options);
        });
        this._rectangle.setMap(this._map._googleMap);
        this._eventManager.setTarget(this._rectangle);
      });

      this._watchForOptionsChanges();
      this._watchForBoundsChanges();
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    if (this._rectangle) {
      this._rectangle.setMap(null);
    }
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getBounds
   */
  getBounds(): google.maps.LatLngBounds {
    return this._rectangle.getBounds();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getDraggable
   */
  getDraggable(): boolean {
    return this._rectangle.getDraggable();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getEditable
   */
  getEditable(): boolean {
    return this._rectangle.getEditable();
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle.getVisible
   */
  getVisible(): boolean {
    return this._rectangle.getVisible();
  }

  private _combineOptions(): Observable<google.maps.RectangleOptions> {
    return combineLatest([this._options, this._bounds]).pipe(map(([options, bounds]) => {
      const combinedOptions: google.maps.RectangleOptions = {
        ...options,
        bounds: bounds || options.bounds,
      };
      return combinedOptions;
    }));
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe(options => {
      this._rectangle.setOptions(options);
    });
  }

  private _watchForBoundsChanges() {
    this._bounds.pipe(takeUntil(this._destroyed)).subscribe(bounds => {
      if (bounds) {
        this._rectangle.setBounds(bounds);
      }
    });
  }
}
