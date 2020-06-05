/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />

import {Directive, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps Ground Overlay via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/image-overlay#GroundOverlay
 */
@Directive({
  selector: 'map-ground-overlay',
  exportAs: 'mapGroundOverlay',
})
export class MapGroundOverlay implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager(this._ngZone);

  private readonly _opacity = new BehaviorSubject<number>(1);
  private readonly _url = new BehaviorSubject<string>('');
  private readonly _destroyed = new Subject<void>();

  /**
   * The underlying google.maps.GroundOverlay object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/image-overlay#GroundOverlay
   */
  groundOverlay?: google.maps.GroundOverlay;

  /** URL of the image that will be shown in the overlay. */
  @Input()
  set url(url: string) {
    this._url.next(url);
  }

  /** Bounds for the overlay. */
  @Input() bounds: google.maps.LatLngBounds|google.maps.LatLngBoundsLiteral;

  /** Whether the overlay is clickable */
  @Input() clickable: boolean = false;

  /** Opacity of the overlay. */
  @Input()
  set opacity(opacity: number) {
    this._opacity.next(opacity);
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay#GroundOverlay.click
   */
  @Output()
  mapClick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('click');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.dblclick
   */
  @Output()
  mapDblclick: Observable<google.maps.MouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.MouseEvent>('dblclick');

  constructor(private readonly _map: GoogleMap, private readonly _ngZone: NgZone) {}

  ngOnInit() {
    if (!this.bounds) {
      throw Error('Image bounds are required');
    }
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe(options => {
        // Create the object outside the zone so its events don't trigger change detection.
        // We'll bring it back in inside the `MapEventManager` only for the events that the
        // user has subscribed to.
        this._ngZone.runOutsideAngular(() => {
          this.groundOverlay =
              new google.maps.GroundOverlay(this._url.getValue(), this.bounds, options);
        });
        this._assertInitialized();
        this.groundOverlay.setMap(this._map.googleMap!);
        this._eventManager.setTarget(this.groundOverlay);
      });

      this._watchForOpacityChanges();
      this._watchForUrlChanges();
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    if (this.groundOverlay) {
      this.groundOverlay.setMap(null);
    }
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getBounds
   */
  getBounds(): google.maps.LatLngBounds {
    this._assertInitialized();
    return this.groundOverlay.getBounds();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getOpacity
   */
  getOpacity(): number {
    this._assertInitialized();
    return this.groundOverlay.getOpacity();
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/image-overlay
   * #GroundOverlay.getUrl
   */
  getUrl(): string {
    this._assertInitialized();
    return this.groundOverlay.getUrl();
  }

  private _combineOptions(): Observable<google.maps.GroundOverlayOptions> {
    return this._opacity.pipe(map(opacity => {
      const combinedOptions: google.maps.GroundOverlayOptions = {
        clickable: this.clickable,
        opacity,
      };
      return combinedOptions;
    }));
  }

  private _watchForOpacityChanges() {
    this._opacity.pipe(takeUntil(this._destroyed)).subscribe(opacity => {
      if (opacity) {
        this._assertInitialized();
        this.groundOverlay.setOpacity(opacity);
      }
    });
  }

  private _watchForUrlChanges() {
    this._url.pipe(takeUntil(this._destroyed)).subscribe(url => {
      this._assertInitialized();
      const overlay = this.groundOverlay;
      overlay.set('url', url);

      // Google Maps only redraws the overlay if we re-set the map.
      overlay.setMap(null);
      overlay.setMap(this._map.googleMap!);
    });
  }

  private _assertInitialized(): asserts this is {groundOverlay: google.maps.GroundOverlay} {
    if (!this._map.googleMap) {
      throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.');
    }
    if (!this.groundOverlay) {
      throw Error(
          'Cannot interact with a Google Map GroundOverlay before it has been initialized. ' +
          'Please wait for the GroundOverlay to load before trying to interact with it.');
    }
  }
}
