# MapKmlLayer

The `MapKmlLayer` component wraps the [`google.maps.KmlLayer` class](https://developers.google.com/maps/documentation/javascript/reference/kml#KmlLayer) from the Google Maps JavaScript API.

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

  kmlUrl = 'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml';
}
```

```html
<!-- google-maps-demo.component.html -->
<google-map height="400px"
            width="750px"
            [center]="center"
            [zoom]="zoom">
  <map-kml-layer [url]="kmlUrl"></map-kml-layer>
</google-map>
```
