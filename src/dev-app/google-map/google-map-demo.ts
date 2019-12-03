/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {MapInfoWindow, MapMarker} from '@angular/google-maps';

const POLYLINE_PATH: google.maps.LatLngLiteral[] =
    [{lat: 25, lng: 26}, {lat: 26, lng: 27}, {lat: 30, lng: 34}];

/** Demo Component for @angular/google-maps/map */
@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  styleUrls: ['google-map-demo.css']
})
export class GoogleMapDemo {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  center = {lat: 24, lng: 12};
  markerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  zoom = 4;
  display?: google.maps.LatLngLiteral;
  isPolylineDisplayed = false;
  polylineOptions:
      google.maps.PolylineOptions = {path: POLYLINE_PATH, strokeColor: 'grey', strokeOpacity: 0.8};

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

  togglePolylineDisplay() {
    this.isPolylineDisplayed = !this.isPolylineDisplayed;
  }

  toggleEditablePolyline() {
    this.polylineOptions = {...this.polylineOptions, editable: !this.polylineOptions.editable};
  }
}
