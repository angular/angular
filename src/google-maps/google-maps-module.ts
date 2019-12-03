/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {GoogleMap} from './google-map/google-map';
import {MapInfoWindow} from './map-info-window/map-info-window';
import {MapMarker} from './map-marker/map-marker';
import {MapPolyline} from './map-polyline/map-polyline';

const COMPONENTS = [
  GoogleMap,
  MapInfoWindow,
  MapMarker,
  MapPolyline,
];

@NgModule({
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class GoogleMapsModule {
}
