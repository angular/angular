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
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';
import {MapEventManager} from '../map-event-manager';

/**
 * Angular component that renders a Google Maps KML Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer
 */
@Directive({
  selector: 'map-kml-layer',
  exportAs: 'mapKmlLayer',
})
export class MapKmlLayer implements OnInit, OnDestroy {
  private _eventManager = new MapEventManager(this._ngZone);
  private readonly _options = new BehaviorSubject<google.maps.KmlLayerOptions>({});
  private readonly _url = new BehaviorSubject<string>('');

  private readonly _destroyed = new Subject<void>();

  /**
   * The underlying google.maps.KmlLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer
   */
  kmlLayer?: google.maps.KmlLayer;

  @Input()
  set options(options: google.maps.KmlLayerOptions) {
    this._options.next(options || {});
  }

  @Input()
  set url(url: string) {
    this._url.next(url);
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.click
   */
  @Output()
  kmlClick: Observable<google.maps.KmlMouseEvent> =
      this._eventManager.getLazyEmitter<google.maps.KmlMouseEvent>('click');

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/kml
   * #KmlLayer.defaultviewport_changed
   */
  @Output()
  defaultviewportChanged: Observable<void> =
      this._eventManager.getLazyEmitter<void>('defaultviewport_changed');

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.status_changed
   */
  @Output()
  statusChanged: Observable<void> = this._eventManager.getLazyEmitter<void>('status_changed');

  constructor(private readonly _map: GoogleMap, private _ngZone: NgZone) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe(options => {
        // Create the object outside the zone so its events don't trigger change detection.
        // We'll bring it back in inside the `MapEventManager` only for the events that the
        // user has subscribed to.
        this._ngZone.runOutsideAngular(() => this.kmlLayer = new google.maps.KmlLayer(options));
        this._assertInitialized();
        this.kmlLayer.setMap(this._map.googleMap!);
        this._eventManager.setTarget(this.kmlLayer);
      });

      this._watchForOptionsChanges();
      this._watchForUrlChanges();
    }
  }

  ngOnDestroy() {
    this._eventManager.destroy();
    this._destroyed.next();
    this._destroyed.complete();
    if (this.kmlLayer) {
      this.kmlLayer.setMap(null);
    }
  }

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getDefaultViewport
   */
  getDefaultViewport(): google.maps.LatLngBounds {
    this._assertInitialized();
    return this.kmlLayer.getDefaultViewport();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getMetadata
   */
  getMetadata(): google.maps.KmlLayerMetadata {
    this._assertInitialized();
    return this.kmlLayer.getMetadata();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getStatus
   */
  getStatus(): google.maps.KmlLayerStatus {
    this._assertInitialized();
    return this.kmlLayer.getStatus();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getUrl
   */
  getUrl(): string {
    this._assertInitialized();
    return this.kmlLayer.getUrl();
  }

  /**
   * See developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer.getZIndex
   */
  getZIndex(): number {
    this._assertInitialized();
    return this.kmlLayer.getZIndex();
  }

  private _combineOptions(): Observable<google.maps.KmlLayerOptions> {
    return combineLatest([this._options, this._url]).pipe(map(([options, url]) => {
      const combinedOptions: google.maps.KmlLayerOptions = {
        ...options,
        url: url || options.url,
      };
      return combinedOptions;
    }));
  }

  private _watchForOptionsChanges() {
    this._options.pipe(takeUntil(this._destroyed)).subscribe(options => {
      if (this.kmlLayer) {
        this._assertInitialized();
        this.kmlLayer.setOptions(options);
      }
    });
  }

  private _watchForUrlChanges() {
    this._url.pipe(takeUntil(this._destroyed)).subscribe(url => {
      if (url && this.kmlLayer) {
        this._assertInitialized();
        this.kmlLayer.setUrl(url);
      }
    });
  }

  private _assertInitialized(): asserts this is { kmlLayer: google.maps.KmlLayer } {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!this._map.googleMap) {
        throw Error(
            'Cannot access Google Map information before the API has been initialized. ' +
            'Please wait for the API to load before trying to interact with it.');
      }
      if (!this.kmlLayer) {
        throw Error(
            'Cannot interact with a Google Map KmlLayer before it has been ' +
            'initialized. Please wait for the KmlLayer to load before trying to interact with it.');
      }
    }
  }
}
