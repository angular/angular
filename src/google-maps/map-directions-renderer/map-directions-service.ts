/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="google.maps" />

import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';

export interface MapDirectionsResponse {
  status: google.maps.DirectionsStatus;
  result?: google.maps.DirectionsResult;
}

/**
 * Angular service that wraps the Google Maps DirectionsService from the Google Maps JavaScript
 * API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/directions#DirectionsService
 */
@Injectable({providedIn: 'root'})
export class MapDirectionsService {
  private _directionsService: google.maps.DirectionsService | undefined;

  constructor(private readonly _ngZone: NgZone) {}

  /**
   * See
   * developers.google.com/maps/documentation/javascript/reference/directions
   * #DirectionsService.route
   */
  route(request: google.maps.DirectionsRequest): Observable<MapDirectionsResponse> {
    return new Observable(observer => {
      // Initialize the `DirectionsService` lazily since the Google Maps API may
      // not have been loaded when the provider is instantiated.
      if (!this._directionsService) {
        this._directionsService = new google.maps.DirectionsService();
      }

      this._directionsService.route(request, (result, status) => {
        this._ngZone.run(() => {
          observer.next({result: result || undefined, status});
          observer.complete();
        });
      });
    });
  }
}
