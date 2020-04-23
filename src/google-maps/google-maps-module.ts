/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {GoogleMap} from './google-map/google-map';
import {MapCircle} from './map-circle/map-circle';
import {MapGroundOverlay} from './map-ground-overlay/map-ground-overlay';
import {MapInfoWindow} from './map-info-window/map-info-window';
import {MapMarker} from './map-marker/map-marker';
import {MapPolygon} from './map-polygon/map-polygon';
import {MapPolyline} from './map-polyline/map-polyline';
import {MapRectangle} from './map-rectangle/map-rectangle';

const COMPONENTS = [
  GoogleMap,
  MapCircle,
  MapGroundOverlay,
  MapInfoWindow,
  MapMarker,
  MapPolygon,
  MapPolyline,
  MapRectangle,
];

@NgModule({
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class GoogleMapsModule {
}
