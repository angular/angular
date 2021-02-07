# MapHeatmapLayer

The `MapHeatmapLayer` directive wraps the [`google.maps.visualization.HeatmapLayer` class](https://developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayer) from the Google Maps Visualization JavaScript API. It displays
a heatmap layer on the map when it is a content child of a `GoogleMap` component. Like `GoogleMap`,
this directive offers an `options` input as well as a convenience input for passing in the `data`
that is shown on the heatmap.

## Requirements

In order to render a heatmap, the Google Maps JavaScript API has to be loaded with the
`visualization` library. To load the library, you have to add `&libraries=visualization` to the
script that loads the Google Maps API. E.g.

**Before:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
```

**After:**
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization"></script>
```

More information: https://developers.google.com/maps/documentation/javascript/heatmaplayer

## Example

```typescript
// google-map-demo.component.ts
import {Component} from '@angular/core';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  center = {lat: 37.774546, lng: -122.433523};
  zoom = 12;
  heatmapOptions = {radius: 5};
  heatmapData = [
    {lat: 37.782, lng: -122.447},
    {lat: 37.782, lng: -122.445},
    {lat: 37.782, lng: -122.443},
    {lat: 37.782, lng: -122.441},
    {lat: 37.782, lng: -122.439},
    {lat: 37.782, lng: -122.437},
    {lat: 37.782, lng: -122.435},
    {lat: 37.785, lng: -122.447},
    {lat: 37.785, lng: -122.445},
    {lat: 37.785, lng: -122.443},
    {lat: 37.785, lng: -122.441},
    {lat: 37.785, lng: -122.439},
    {lat: 37.785, lng: -122.437},
    {lat: 37.785, lng: -122.435}
  ];
}
```

```html
<!-- google-map-demo.component.html -->
<google-map height="400px" width="750px" [center]="center" [zoom]="zoom">
  <map-heatmap-layer [data]="heatmapData" [options]="heatmapOptions"></map-heatmap-layer>
</google-map>
```
