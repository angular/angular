/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {GoogleMap} from './google-map/google-map';
import {MapBaseLayer} from './map-base-layer';
import {MapBicyclingLayer} from './map-bicycling-layer/map-bicycling-layer';
import {MapCircle} from './map-circle/map-circle';
import {MapGroundOverlay} from './map-ground-overlay/map-ground-overlay';
import {MapInfoWindow} from './map-info-window/map-info-window';
import {MapKmlLayer} from './map-kml-layer/map-kml-layer';
import {MapMarker} from './map-marker/map-marker';
import {MapMarkerClusterer} from './map-marker-clusterer/map-marker-clusterer';
import {MapPolygon} from './map-polygon/map-polygon';
import {MapPolyline} from './map-polyline/map-polyline';
import {MapRectangle} from './map-rectangle/map-rectangle';
import {MapTrafficLayer} from './map-traffic-layer/map-traffic-layer';
import {MapTransitLayer} from './map-transit-layer/map-transit-layer';

const COMPONENTS = [
  GoogleMap,
  MapBaseLayer,
  MapBicyclingLayer,
  MapCircle,
  MapGroundOverlay,
  MapInfoWindow,
  MapKmlLayer,
  MapMarker,
  MapMarkerClusterer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  MapTrafficLayer,
  MapTransitLayer,
];

@NgModule({
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class GoogleMapsModule {
}
