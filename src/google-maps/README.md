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

```html
<!-- index.html -->
<!doctype html>
<head>
  ...
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY">
  </script>
</head>
```

## Lazy Loading the API

The API can be loaded when the component is actually used by using the Angular HttpClient jsonp method to make sure that the component doesn't load until after the API has loaded.

```typescript
// google-maps-demo.module.ts

import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { GoogleMapsDemoComponent } from './google-maps-demo.component';

@NgModule({
  declarations: [
    GoogleMapsDemoComponent,
  ],
  imports: [
    CommonModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
  ],
  exports: [
    GoogleMapsDemoComponent,
  ],
})
export class GoogleMapsDemoModule {}


// google-maps-demo.component.ts

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'google-maps-demo',
  templateUrl: './google-maps-demo.component.html',
})
export class GoogleMapsDemoComponent {
  apiLoaded: Observable<boolean>;

  constructor(httpClient: HttpClient) {
    this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE', 'callback')
        .pipe(
          map(() => true),
          catchError(() => of(false)),
        );
  }
}
```

```html
<!-- google-maps-demo.component.html -->

<div *ngIf="apiLoaded | async">
  <google-map></google-map>
</div>
```

## Components

- [`GoogleMap`](./google-map/README.md)
- [`MapMarker`](./map-marker/README.md)
- [`MapInfoWindow`](./map-info-window/README.md)
- [`MapPolyline`](./map-polyline/README.md)
- [`MapPolygon`](./map-polygon/README.md)
- [`MapRectangle`](./map-rectangle/README.md)
- [`MapCircle`](./map-circle/README.md)
- [`MapGroundOverlay`](./map-ground-overlay/README.md)
- [`MapKmlLayer`](./map-kml-layer/README.md)
- [`MapTrafficLayer`](./map-traffic-layer/README.md)
- [`MapTransitLayer`](./map-transit-layer/README.md)
- [`MapBicyclingLayer`](./map-bicycling-layer/README.md)

## The Options Input

The Google Maps components implement all of the options for their respective objects from the Google Maps JavaScript API through an `options` input, but they also have specific inputs for some of the most common options. For example, the Google Maps component could have its options set either in with a google.maps.MapOptions object:

```html
<google-map [options]="options"></google-map>
```

```typescript
options: google.maps.MapOptions = {
  center: {lat: 40, lng: -20},
  zoom: 4
};
```

It can also have individual options set for some of the most common options:

```html
<google-map [center]="center"
            [zoom]="zoom"></google-map>
```

```typescript
center: google.maps.LatLngLiteral = {lat: 40, lng: -20};
zoom = 4;
```

Not every option has its own input. See the API for each component to see if the option has a dedicated input or if it should be set in the options input.
