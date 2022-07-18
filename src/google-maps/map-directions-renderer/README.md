# MapDirectionsRenderer

The `MapDirectionsRenderer` component wraps the [`google.maps.DirectionsRenderer` class](https://developers.google.com/maps/documentation/javascript/reference/directions#DirectionsRenderer) from the Google Maps JavaScript API. This can easily be used with the `MapDirectionsService` that wraps [`google.maps.DirectionsService`](https://developers.google.com/maps/documentation/javascript/reference/directions#DirectionsService) which is designed to be used with Angular by returning an `Observable` response and works inside the Angular Zone.

The `MapDirectionsService`, like the `google.maps.DirectionsService`, has a single method, `route`. Normally, the `google.maps.DirectionsService` takes two arguments, a `google.maps.DirectionsRequest` and a callback that takes the `google.maps.DirectionsResult` and `google.maps.DirectionsStatus` as arguments. The `MapDirectionsService` route method takes the `google.maps.DirectionsRequest` as the single argument, and returns an `Observable` of a `MapDirectionsResponse`, which is an interface defined as follows:

```typescript
export interface MapDirectionsResponse {
  status: google.maps.DirectionsStatus;
  result?: google.maps.DirectionsResult;
}
```

The most common use-case for the component and class would be to use the `MapDirectionsService` to request a route between two points on the map, and then render them on the map using the `MapDirectionsRenderer`.

## Loading the Library

Using the `MapDirectionsService` requires the Directions API to be enabled in Google Cloud Console on the same project as the one set up for the Google Maps JavaScript API, and requires an API key that has billing enabled. See [here](https://developers.google.com/maps/documentation/javascript/directions#GetStarted) for details.

## Example

```typescript
// google-maps-demo.component.ts
import {MapDirectionsService} from '@angular/google-maps';
import {Component} from '@angular/core';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;

  readonly directionsResults$: Observable<google.maps.DirectionsResult|undefined>;

  constructor(mapDirectionsService: MapDirectionsService) {
    const request: google.maps.DirectionsRequest = {
      destination: {lat: 12, lng: 4},
      origin: {lat: 14, lng: 8},
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.directionsResults$ = mapDirectionsService.route(request).pipe(map(response => response.result));
  }
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map height="400px"
            width="750px"
            [center]="center"
            [zoom]="zoom">
  <map-directions-renderer *ngIf="(directionsResults$ | async) as directionsResults"
                           [directions]="directionsResults"></map-directions-renderer>
</google-map>
```
