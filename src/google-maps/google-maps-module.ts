/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {GoogleMap, GoogleMapModule} from './google-map/index';
import {MapInfoWindow, MapInfoWindowModule} from './map-info-window/index';
import {MapMarker, MapMarkerModule} from './map-marker/index';

@NgModule({
  imports: [
    GoogleMapModule,
    MapInfoWindowModule,
    MapMarkerModule,
  ],
  exports: [
    GoogleMap,
    MapInfoWindow,
    MapMarker,
  ],
})
export class GoogleMapsModule {
}
