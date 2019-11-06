/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {MapInfoWindow, MapMarker} from '@angular/google-maps';

/** Demo Component for @angular/google-maps/map */
@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  center = {lat: 24, lng: 12};
  markerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  infoWindowPosition: google.maps.LatLngLiteral;
  zoom = 4;
  display?: google.maps.LatLngLiteral;

  handleClick(event: google.maps.MouseEvent) {
    this.markerPositions.push(event.latLng.toJSON());
  }

  handleMove(event: google.maps.MouseEvent) {
    this.display = event.latLng.toJSON();
  }

  clickMarker(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  handleRightclick() {
    this.markerPositions.pop();
  }
}
