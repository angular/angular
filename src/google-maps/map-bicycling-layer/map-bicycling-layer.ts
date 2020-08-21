/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1265
/// <reference types="googlemaps" />

import {Directive} from '@angular/core';

import {MapBaseLayer} from '../map-base-layer';

/**
 * Angular component that renders a Google Maps Bicycling Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer
 */
@Directive({
  selector: 'map-bicycling-layer',
  exportAs: 'mapBicyclingLayer',
})
export class MapBicyclingLayer extends MapBaseLayer {
  /**
   * The underlying google.maps.BicyclingLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer
   */
  bicyclingLayer?: google.maps.BicyclingLayer;

  protected _initializeObject() {
    this.bicyclingLayer = new google.maps.BicyclingLayer();
  }

  protected _setMap() {
    this._assertLayerInitialized();
    this.bicyclingLayer.setMap(this._map.googleMap!);
  }

  protected _unsetMap() {
    if (this.bicyclingLayer) {
      this.bicyclingLayer.setMap(null);
    }
  }

  private _assertLayerInitialized(): asserts this is {bicyclingLayer: google.maps.BicyclingLayer} {
    if (!this.bicyclingLayer) {
      throw Error(
          'Cannot interact with a Google Map Bicycling Layer before it has been initialized. ' +
          'Please wait for the Transit Layer to load before trying to interact with it.');
    }
  }
}
