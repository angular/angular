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
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';

/**
 * Angular component that renders a Google Maps Polyline via the Google Maps JavaScript API.
 * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline
 */
@Directive({
  selector: 'map-polyline',
})
export class MapPolyline implements OnInit, OnDestroy {
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
  @Output() polylineClick = new EventEmitter<google.maps.PolyMouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dblclick
   */
  @Output() polylineDblclick = new EventEmitter<google.maps.PolyMouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.drag
   */
  @Output() polylineDrag = new EventEmitter<google.maps.MouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dragend
   */
  @Output() polylineDragend = new EventEmitter<google.maps.MouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.dragstart
   */
  @Output() polylineDragstart = new EventEmitter<google.maps.MouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mousedown
   */
  @Output() polylineMousedown = new EventEmitter<google.maps.PolyMouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mousemove
   */
  @Output() polylineMousemove = new EventEmitter<google.maps.PolyMouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseout
   */
  @Output() polylineMouseout = new EventEmitter<google.maps.PolyMouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseover
   */
  @Output() polylineMouseover = new EventEmitter<google.maps.PolyMouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.mouseup
   */
  @Output() polylineMouseup = new EventEmitter<google.maps.PolyMouseEvent>();

  /**
   * @see developers.google.com/maps/documentation/javascript/reference/polygon#Polyline.rightclick
   */
  @Output() polylineRightclick = new EventEmitter<google.maps.PolyMouseEvent>();

  private readonly _options = new BehaviorSubject<google.maps.PolylineOptions>({});
  private readonly _path =
      new BehaviorSubject<google.maps.MVCArray<google.maps.LatLng>|google.maps.LatLng[]|
                          google.maps.LatLngLiteral[]|undefined>(undefined);

  private readonly _destroyed = new Subject<void>();

  private readonly _listeners: google.maps.MapsEventListener[] = [];

  _polyline!: google.maps.Polyline; // initialized in ngOnInit

  constructor(private readonly _map: GoogleMap) {}

  ngOnInit() {
    const combinedOptionsChanges = this._combineOptions();

    combinedOptionsChanges.pipe(take(1)).subscribe(options => {
      this._polyline = new google.maps.Polyline(options);
      this._polyline.setMap(this._map._googleMap);
      this._initializeEventHandlers();
    });

    this._watchForOptionsChanges();
    this._watchForPathChanges();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    for (let listener of this._listeners) {
      listener.remove();
    }
    this._polyline.setMap(null);
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

  private _initializeEventHandlers() {
    const mouseEventHandlers = new Map<string, EventEmitter<google.maps.MouseEvent>>([
      ['drag', this.polylineDrag],
      ['dragend', this.polylineDragend],
      ['dragstart', this.polylineDragstart],
    ]);
    const polyMouseEventHandlers = new Map<string, EventEmitter<google.maps.PolyMouseEvent>>([
      ['click', this.polylineClick],
      ['dblclick', this.polylineDblclick],
      ['mousedown', this.polylineMousedown],
      ['mousemove', this.polylineMousemove],
      ['mouseout', this.polylineMouseout],
      ['mouseover', this.polylineMouseover],
      ['mouseup', this.polylineMouseup],
      ['rightclick', this.polylineRightclick],
    ]);

    mouseEventHandlers.forEach(
        (eventHandler: EventEmitter<google.maps.MouseEvent>, name: string) => {
          if (eventHandler.observers.length > 0) {
            this._listeners.push(
                this._polyline.addListener(name, (event: google.maps.MouseEvent) => {
                  eventHandler.emit(event);
                }));
          }
        });

    polyMouseEventHandlers.forEach(
        (eventHandler: EventEmitter<google.maps.PolyMouseEvent>, name: string) => {
          if (eventHandler.observers.length > 0) {
            this._listeners.push(
                this._polyline.addListener(name, (event: google.maps.PolyMouseEvent) => {
                  eventHandler.emit(event);
                }));
          }
        });
  }
}
