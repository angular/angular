# Angular Google Maps component

This component provides a Google Maps Angular component that implements the
[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial).
File any bugs against the [angular/components repo](https://github.com/angular/components/issues).

## Installation

To install, run `npm install @angular/google-maps`.

## Loading the API

- First follow [these steps](https://developers.google.com/maps/gmp-get-started) to get an API key that can be used to load Google Maps.
- Load the [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial#Loading_the_Maps_API).
- The Google Maps JavaScript API must be loaded before the `GoogleMap` component.

## GoogleMap

The `GoogleMap` component wraps the [`google.maps.Map` class](https://developers.google.com/maps/documentation/javascript/reference/map) from the Google Maps JavaScript API. You can configure the map via the component's inputs. The `options` input accepts a full [`google.maps.MapOptions` object](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions), and the component additionally offers convenience inputs for setting the `center` and `zoom` of the map without needing an entire `google.maps.MapOptions` object. The `height` and `width` inputs accept a string to set the size of the Google map. [Events](https://developers.google.com/maps/documentation/javascript/reference/map#Map.bounds_changed) can be bound using the outputs of the `GoogleMap` component, although events have the same name as native mouse events (e.g. `mouseenter`) have been prefixed with "map" as to not collide with the native mouse events. Other members on the `google.maps.Map` object are available on the `GoogleMap` component and can be accessed using the [`ViewChild` decorator](https://angular.io/api/core/ViewChild).

See the [example](#example) below or the [source](./google-map/google-map.ts) to read the API.

## MapMarker

The `MapMarker` component wraps the [`google.maps.Marker` class](https://developers.google.com/maps/documentation/javascript/reference/marker#Marker) from the Google Maps JavaScript API. The `MapMarker` component displays a marker on the map when it is a content child of a `GoogleMap` component. Like `GoogleMap`, this component offers an `options` input as well as convenience inputs for `position`, `title`, `label`, and `clickable`, and supports all `google.maps.Marker` events as outputs.

See the [example](#example) below or the [source](./map-marker/map-marker.ts) to read the API.

## MapInfoWindow

The `MapInfoWindow` component wraps the [`google.maps.InfoWindow` class](https://developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow) from the Google Maps JavaScript API. The `MapInfoWindow` has a `options` input as well as a convenience `position` input. Content for the `MapInfoWindow` is the inner HTML of the component, and will keep the structure and css styling of any content that is put there when it is displayed as an info window on the map.

To display the `MapInfoWindow`, it must be a child of a `GoogleMap` component, and it must have its `open` method called, so a reference to `MapInfoWindow` will need to be loaded using the [`ViewChild` decorator](https://angular.io/api/core/ViewChild). The `open` method accepts an `MapMarker` as an optional input, if you want to anchor the `MapInfoWindow` to a `MapMarker`.

See the [example](#example) below or the [source](./map-info-window/map-info-window.ts) to read the API.

## Example

```typescript
// example-module.ts

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {GoogleMapsModule} from '@angular/google-maps';

import {GoogleMapDemo} from './google-map-demo';

@NgModule({
  imports: [
    CommonModule,
    GoogleMapsModule,
  ],
  declarations: [GoogleMapDemo],
})
export class GoogleMapDemoModule {
}


// example-app.ts
import {Component, ViewChild} from '@angular/core';
import {MapInfoWindow, MapMarker} from '@angular/google-maps';

/** Demo Component for @angular/google-maps/map */
@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  @ViewChild(MapInfoWindow, {static: false}) infoWindow: MapInfoWindow;

  center = {lat: 24, lng: 12};
  markerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  zoom = 4;
  display?: google.maps.LatLngLiteral;

  addMarker(event: google.maps.MouseEvent) {
    this.markerPositions.push(event.latLng.toJSON());
  }

  move(event: google.maps.MouseEvent) {
    this.display = event.latLng.toJSON();
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  removeLastMarker() {
    this.markerPositions.pop();
  }
}
```

```html
<!-- index.html -->
<!doctype html>
<head>
  ...
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY">
  </script>
</head>

<!-- example-app.html -->
<google-map height="400px"
            width="750px"
            [center]="center"
            [zoom]="zoom"
            (mapClick)="addMarker($event)"
            (mapMousemove)="move($event)"
            (mapRightclick)="removeLastMarker()">
  <map-marker #marker
              *ngFor="let markerPosition of markerPositions"
              [position]="markerPosition"
              [options]="markerOptions"
              (mapClick)="openInfoWindow(marker)"></map-marker>
  <map-info-window>Info Window content</map-info-window>
</google-map>

<div>Latitude: {{display?.lat}}</div>
<div>Longitude: {{display?.lng}}</div>
```
