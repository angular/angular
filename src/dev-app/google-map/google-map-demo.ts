/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';

/** Demo Component for @angular/google-maps/map */
@Component({
  moduleId: module.id,
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  isReady = false;

  center = {lat: 24, lng: 12};
  markerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  zoom = 4;
  display?: google.maps.LatLngLiteral;

  constructor(httpClient: HttpClient) {
    httpClient.jsonp('https://maps.googleapis.com/maps/api/js?', 'callback')
      .subscribe(() => {
        this.isReady = true;
      });
  }

  handleClick(event: google.maps.MouseEvent) {
    this.markerPositions.push(event.latLng.toJSON());
  }

  handleMove(event: google.maps.MouseEvent) {
    this.display = event.latLng.toJSON();
  }

  clickMarker(event: google.maps.MouseEvent) {
    console.log(this.markerOptions);
    this.markerOptions = {draggable: true};
  }

  handleRightclick() {
    this.markerPositions.pop();
  }
}
