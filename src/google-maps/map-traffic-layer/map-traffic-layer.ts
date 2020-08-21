/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />

import {Directive, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';

import {GoogleMap} from '../google-map/google-map';

/**
 * Angular component that renders a Google Maps Traffic Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#TrafficLayer
 */
@Directive({
  selector: 'map-traffic-layer',
  exportAs: 'mapTrafficLayer',
})
export class MapTrafficLayer implements OnInit, OnDestroy {
  private readonly _autoRefresh = new BehaviorSubject<boolean>(true);
  private readonly _destroyed = new Subject<void>();

  /**
   * The underlying google.maps.TrafficLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#TrafficLayer
   */
  trafficLayer?: google.maps.TrafficLayer;

  /**
   * Whether the traffic layer refreshes with updated information automatically.
   */
  @Input()
  set autoRefresh(autoRefresh: boolean) {
    this._autoRefresh.next(autoRefresh);
  }

  constructor(private readonly _map: GoogleMap, private readonly _ngZone: NgZone) {}

  ngOnInit() {
    if (this._map._isBrowser) {
      this._combineOptions().pipe(take(1)).subscribe(options => {
        // Create the object outside the zone so its events don't trigger change detection.
        this._ngZone.runOutsideAngular(() => {
          this.trafficLayer = new google.maps.TrafficLayer(options);
        });
        this._assertInitialized();
        this.trafficLayer.setMap(this._map.googleMap!);
      });

      this._watchForAutoRefreshChanges();
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    if (this.trafficLayer) {
      this.trafficLayer.setMap(null);
    }
  }

  private _combineOptions(): Observable<google.maps.TrafficLayerOptions> {
    return this._autoRefresh.pipe(map(autoRefresh => {
      const combinedOptions: google.maps.TrafficLayerOptions = {autoRefresh};
      return combinedOptions;
    }));
  }

  private _watchForAutoRefreshChanges() {
    this._combineOptions().pipe(takeUntil(this._destroyed)).subscribe(options => {
      this._assertInitialized();
      this.trafficLayer.setOptions(options);
    });
  }

  private _assertInitialized(): asserts this is {trafficLayer: google.maps.TrafficLayer} {
    if (!this._map.googleMap) {
      throw Error(
          'Cannot access Google Map information before the API has been initialized. ' +
          'Please wait for the API to load before trying to interact with it.');
    }
    if (!this.trafficLayer) {
      throw Error(
          'Cannot interact with a Google Map Traffic Layer before it has been initialized. ' +
          'Please wait for the Traffic Layer to load before trying to interact with it.');
    }
  }
}
