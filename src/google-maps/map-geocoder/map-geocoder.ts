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

export interface MapGeocoderResponse {
  status: google.maps.GeocoderStatus;
  results: google.maps.GeocoderResult[];
}

/**
 * Angular service that wraps the Google Maps Geocoder from the Google Maps JavaScript API.
 * See developers.google.com/maps/documentation/javascript/reference/geocoder#Geocoder
 */
@Injectable({providedIn: 'root'})
export class MapGeocoder {
  private _geocoder: google.maps.Geocoder | undefined;

  constructor(private readonly _ngZone: NgZone) {}

  /**
   * See developers.google.com/maps/documentation/javascript/reference/geocoder#Geocoder.geocode
   */
  geocode(request: google.maps.GeocoderRequest): Observable<MapGeocoderResponse> {
    return new Observable(observer => {
      // Initialize the `Geocoder` lazily since the Google Maps API may
      // not have been loaded when the provider is instantiated.
      if (!this._geocoder) {
        this._geocoder = new google.maps.Geocoder();
      }

      this._geocoder.geocode(request, (results, status) => {
        this._ngZone.run(() => {
          observer.next({results: results || [], status});
          observer.complete();
        });
      });
    });
  }
}
