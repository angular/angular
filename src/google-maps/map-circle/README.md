# MapCircle

The `MapCircle` component wraps the [`google.maps.Circle` class](https://developers.google.com/maps/documentation/javascript/reference/polygon#Circle) from the Google Maps JavaScript API.

## Example

```typescript
// google-maps-demo.component.ts
import {Component} from '@angular/core';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;

  circleCenter: google.maps.LatLngLiteral = {lat: 10, lng: 15};
  radius = 3;
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map height="400px"
            width="750px"
            [center]="center"
            [zoom]="zoom">
  <map-circle [center]="circleCenter"
              [radius]="radius"></map-circle>
</google-map>
```
