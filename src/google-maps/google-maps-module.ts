/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {MapMarker, MapMarkerModule} from './map-marker/index';
import {GoogleMap, GoogleMapModule} from './google-map/index';

@NgModule({
  imports: [
    GoogleMapModule,
    MapMarkerModule,
  ],
  exports: [
    GoogleMap,
    MapMarker,
  ],
})
export class GoogleMapsModule {
}
