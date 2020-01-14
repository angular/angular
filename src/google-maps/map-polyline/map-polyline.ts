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
  Directive,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Polyline via the Google Maps JavaScript API.
 * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline
 */
@Directive({
  selector: 'map-polyline',
})
export class MapPolyline implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager();
  private readonly _options = new BehaviorSubject<google.maps.PolylineOptions>({});
  private readonly _path =
      new BehaviorSubject<google.maps.MVCArray<google.maps.LatLng>|google.maps.LatLng[]|
                          google.maps.LatLngLiteral[]|undefined>(undefined);

  private readonly _destroyed = new Subject<void>();
  private readonly _listeners: google.maps.MapsEventListener[] = [];

  _polyline: google.maps.Polyline; // initialized in ngOnInit

  @Input()
  set options(options: google.maps.PolylineOptions) {
    this._options.next(options || {});
  }

  @Input()
  set path(path: google.maps.MVCArray<google.maps.LatLng>|google.maps.LatLng[]|
           google.maps.LatLngLiteral[]) {
    this._path.next(path);
  }

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.click
   */
  @Output()
  polylineClick: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('click');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dblclick
   */
  @Output()
  polylineDblclick: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('dblclick');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.drag
   */
  @Output()
  polylineDrag: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('drag');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dragend
   */
  @Output()
  polylineDragend: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dragend');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dragstart
   */
  @Output()
  polylineDragstart: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dragstart');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mousedown
   */
  @Output()
  polylineMousedown: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mousedown');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mousemove
   */
  @Output()
  polylineMousemove: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mousemove');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseout
   */
  @Output()
  polylineMouseout: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mouseout');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseover
   */
  @Output()
  polylineMouseover: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mouseover');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseup
   */
  @Output()
  polylineMouseup: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('mouseup');

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.rightclick
   */
  @Output()
  polylineRightclick: Observable<google.maps.PolyMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.PolyMouseEvent>('rightclick');

  constructor(private readonly _map: GoogleMap) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      const combinedOptionsChanges = this._combineOptions();

      combinedOptionsChanges.pipe(take(1)).subscribe(options => {
        this._polyline = new google.maps.Polyline(options);
        this._polyline.setMap(this._map._googleMap);
        this._eventManager.setTarget(this._polyline);
      });

      this._watchForOptionsChanges();
      this._watchForPathChanges();
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    for (let listener of this._listeners) {
      listener.remove();
    }
    if (this._polyline) {
      this._polyline.setMap(null);
    }
  }

  /**
   * @see
   * developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getDraggable
   */
  getDraggable(): boolean {
    return this._polyline.getDraggable();
  }

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getEditable
   */
  getEditable(): boolean {
    return this._polyline.getEditable();
  }

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getPath
   */
  getPath(): google.maps.MVCArray<google.maps.LatLng> {
    return this._polyline.getPath();
  }

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.getVisible
   */
  getVisible(): boolean {
    return this._polyline.getVisible();
  }

  private _combineOptions(): Observable<google.maps.PolylineOptions> {
    return combineLatest([this._options, this._path]).pipe(map(([options, path]) => {
      const combinedOptions: google.maps.PolylineOptions = {
        ...options,
        path: path || options.path,
      };
      return combinedOptions;
    }));
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe(options => {
      this._polyline.setOptions(options);
    });
  }

  private _watchForPathChanges() {
    this._path.pipe(takeUntil(this._destroyed)).subscribe(path => {
      if (path) {
        this._polyline.setPath(path);
      }
    });
  }
}
