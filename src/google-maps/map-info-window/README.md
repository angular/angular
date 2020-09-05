## MapInfoWindow

The `MapInfoWindow` component wraps the [`google.maps.InfoWindow` class](https://developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindow) from the Google Maps JavaScript API. The `MapInfoWindow` has an `options` input as well as a convenience `position` input. Content for the `MapInfoWindow` is the inner HTML of the component, and will keep the structure and css styling of any content that is put there when it is displayed as an info window on the map.

To display the `MapInfoWindow`, it must be a child of a `GoogleMap` component, and it must have its `open` method called, so a reference to `MapInfoWindow` will need to be loaded using the [`ViewChild` decorator](https://angular.io/api/core/ViewChild). The `open` method accepts an `MapMarker` as an optional input, if you want to anchor the `MapInfoWindow` to a `MapMarker`.

## Example

```typescript
// google-maps-demo.component.ts
import {Component, ViewChild} from '@angular/core';
import {MapInfoWindow, MapMarker} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  markerPositions: google.maps.LatLngLiteral[] = [];
  zoom = 4;

  addMarker(event: google.maps.MouseEvent) {
    this.markerPositions.push(event.latLng.toJSON());
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map height="400px"
            width="750px"
            [center]="center"
            [zoom]="zoom"
            (mapClick)="addMarker($event)">
  <map-marker #marker="mapMarker"
              *ngFor="let markerPosition of markerPositions"
              [position]="markerPosition"
              (mapClick)="openInfoWindow(marker)"></map-marker>
  <map-info-window>Info Window content</map-info-window>
</google-map>
```
