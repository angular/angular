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
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapMarker} from '../map-marker/map-marker';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps info window via the Google Maps JavaScript API.
 * @see developers.google.com/maps/documentation/javascript/reference/info-window
 */
@Directive({
  selector: 'map-info-window',
  host: {'style': 'display: none'},
})
export class MapInfoWindow implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager();
  private readonly _options = new BehaviorSubject<google.maps.InfoWindowOptions>({});
  private readonly _position =
      new BehaviorSubject<google.maps.LatLngLiteral|google.maps.LatLng|undefined>(undefined);
  private readonly _destroy = new Subject<void>();
  private _infoWindow?: google.maps.InfoWindow;

  @Input()
  set options(options: google.maps.InfoWindowOptions) {
    this._options.next(options || {});
  }

  @Input()
  set position(position: google.maps.LatLngLiteral|google.maps.LatLng) {
    this._position.next(position);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.closeclick
   */
  @Output() closeclick: Observable<void> = this._eventManager.getLazyEmitter<void>('closeclick');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.content_changed
   */
  @Output()
  contentChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('content_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.domready
   */
  @Output() domready: Observable<void> = this._eventManager.getLazyEmitter<void>('domready');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.position_changed
   */
  @Output()
  positionChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('position_changed');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.zindex_changed
   */
  @Output()
  zindexChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('zindex_changed');

  constructor(private readonly _googleMap: GoogleMap,
              private _elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    if (this._googleMap._isBrowser) {
      this._combineOptions().pipe(takeUntil(this._destroy)).subscribe(options => {
        if (this._infoWindow) {
          this._infoWindow.setOptions(options);
        } else {
          this._infoWindow = new google.maps.InfoWindow(options);
          this._eventManager.setTarget(this._infoWindow);
        }
      });
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroy.next();
    this._destroy.complete();
    this.close();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.close
   */
  close() {
    if (this._infoWindow) {
      this._infoWindow.close();
    }
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.getContent
   */
  getContent(): string|Node {
    return this._infoWindow!.getContent();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window
   * #InfoWindow.getPosition
   */
  getPosition(): google.maps.LatLng|null {
    return this._infoWindow!.getPosition() || null;
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow.getZIndex
   */
  getZIndex(): number {
    return this._infoWindow!.getZIndex();
  }

  /**
   * Opens the MapInfoWindow using the provided MapMarker as the anchor. If the anchor is not set,
   * then the position property of the options input is used instead.
   */
  open(anchor?: MapMarker) {
    const marker = anchor ? anchor._marker : undefined;
    if (this._googleMap._googleMap && this._infoWindow) {
      this._elementRef.nativeElement.style.display = '';
      this._infoWindow!.open(this._googleMap._googleMap, marker);
    }
  }

  private _combineOptions(): Observable<google.maps.InfoWindowOptions> {
    return combineLatest([this._options, this._position]).pipe(map(([options, position]) => {
      const combinedOptions: google.maps.InfoWindowOptions = {
        ...options,
        position: position || options.position,
        content: this._elementRef.nativeElement,
      };
      return combinedOptions;
    }));
  }
}
