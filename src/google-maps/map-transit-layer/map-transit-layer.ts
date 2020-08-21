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
 * Angular component that renders a Google Maps Transit Layer via the Google Maps JavaScript API.
 *
 * See developers.google.com/maps/documentation/javascript/reference/map#TransitLayer
 */
@Directive({
  selector: 'map-transit-layer',
  exportAs: 'mapTransitLayer',
})
export class MapTransitLayer extends MapBaseLayer {
  /**
   * The underlying google.maps.TransitLayer object.
   *
   * See developers.google.com/maps/documentation/javascript/reference/map#TransitLayer
   */
  transitLayer?: google.maps.TransitLayer;

  protected _initializeObject() {
    this.transitLayer = new google.maps.TransitLayer();
  }

  protected _setMap() {
    this._assertLayerInitialized();
    this.transitLayer.setMap(this._map.googleMap!);
  }

  protected _unsetMap() {
    if (this.transitLayer) {
      this.transitLayer.setMap(null);
    }
  }

  private _assertLayerInitialized(): asserts this is {transitLayer: google.maps.TransitLayer} {
    if (!this.transitLayer) {
      throw Error(
          'Cannot interact with a Google Map Transit Layer before it has been initialized. ' +
          'Please wait for the Transit Layer to load before trying to interact with it.');
    }
  }
}
