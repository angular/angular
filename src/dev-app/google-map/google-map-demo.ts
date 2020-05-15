/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {
  MapCircle,
  MapInfoWindow,
  MapMarker,
  MapPolygon,
  MapPolyline,
  MapRectangle
} from '@angular/google-maps';

const POLYLINE_PATH: google.maps.LatLngLiteral[] =
    [{lat: 25, lng: 26}, {lat: 26, lng: 27}, {lat: 30, lng: 34}];

const POLYGON_PATH: google.maps.LatLngLiteral[] =
    [{lat: 20, lng: 21}, {lat: 22, lng: 23}, {lat: 24, lng: 25}];

const RECTANGLE_BOUNDS: google.maps.LatLngBoundsLiteral = {
  east: 30,
  north: 15,
  west: 10,
  south: -5
};

const CIRCLE_CENTER: google.maps.LatLngLiteral = {
  lat: 19,
  lng: 20
};
const CIRCLE_RADIUS = 500000;

/** Demo Component for @angular/google-maps/map */
@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
  styleUrls: ['google-map-demo.css']
})
export class GoogleMapDemo {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChild(MapPolyline) polyline: MapPolyline;
  @ViewChild(MapPolygon) polygon: MapPolygon;
  @ViewChild(MapRectangle) rectangle: MapRectangle;
  @ViewChild(MapCircle) circle: MapCircle;

  center = {lat: 24, lng: 12};
  markerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  zoom = 4;
  display?: google.maps.LatLngLiteral;
  isPolylineDisplayed = false;
  polylineOptions:
      google.maps.PolylineOptions = {path: POLYLINE_PATH, strokeColor: 'grey', strokeOpacity: 0.8};
  isPolygonDisplayed = false;
  polygonOptions:
      google.maps.PolygonOptions = {paths: POLYGON_PATH, strokeColor: 'grey', strokeOpacity: 0.8};
  isRectangleDisplayed = false;
  rectangleOptions: google.maps
      .RectangleOptions = {bounds: RECTANGLE_BOUNDS, strokeColor: 'grey', strokeOpacity: 0.8};
  isCircleDisplayed = false;
  circleOptions: google.maps.CircleOptions =
      {center: CIRCLE_CENTER, radius: CIRCLE_RADIUS, strokeColor: 'grey', strokeOpacity: 0.8};
  isGroundOverlayDisplayed = false;
  groundOverlayImages = [
    {
      title: 'Red logo',
      url: 'https://angular.io/assets/images/logos/angular/angular.svg'
    },
    {
      title: 'Black logo',
      url: 'https://angular.io/assets/images/logos/angular/angular_solidBlack.svg'
    }
  ];
  groundOverlayUrl = this.groundOverlayImages[0].url;
  groundOverlayBounds = RECTANGLE_BOUNDS;

  mapTypeId: google.maps.MapTypeId;
  mapTypeIds = [
    google.maps.MapTypeId.HYBRID,
    google.maps.MapTypeId.ROADMAP,
    google.maps.MapTypeId.SATELLITE,
    google.maps.MapTypeId.TERRAIN
  ];

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
    this.polylineOptions = {
      ...this.polylineOptions,
      editable: !this.polylineOptions.editable,
      path: this.polyline.getPath()
    };
  }

  togglePolygonDisplay() {
    this.isPolygonDisplayed = !this.isPolygonDisplayed;
  }

  toggleEditablePolygon() {
    this.polygonOptions = {
      ...this.polygonOptions,
      editable: !this.polygonOptions.editable,
      paths: this.polygon.getPaths()
    };
  }

  toggleRectangleDisplay() {
    this.isRectangleDisplayed = !this.isRectangleDisplayed;
  }

  toggleEditableRectangle() {
    this.rectangleOptions = {
      ...this.rectangleOptions,
      editable: !this.rectangleOptions.editable,
      bounds: this.rectangle.getBounds()
    };
  }

  toggleCircleDisplay() {
    this.isCircleDisplayed = !this.isCircleDisplayed;
  }

  toggleEditableCircle() {
    this.circleOptions = {
      ...this.circleOptions,
      editable: !this.circleOptions.editable,
      center: this.circle.getCenter(),
      radius: this.circle.getRadius(),
    };
  }

  mapTypeChanged(event: Event) {
    this.mapTypeId = (event.target as HTMLSelectElement).value as unknown as google.maps.MapTypeId;
  }

  toggleGroundOverlayDisplay() {
    this.isGroundOverlayDisplayed = !this.isGroundOverlayDisplayed;
  }

  groundOverlayUrlChanged(event: Event) {
    this.groundOverlayUrl = (event.target as HTMLSelectElement).value;
  }
}
