# MapGeocoder

The `MapGeocoder`, like the `google.maps.Geocoder`, has a single method, `geocode`. Normally, the
`google.maps.Geocoder` takes two arguments, a `google.maps.GeocoderRequest` and a callback that
takes the `google.maps.GeocoderResult` and `google.maps.GeocoderStatus` as arguments.
The `MapGeocoder.geocode` method takes the `google.maps.GeocoderRequest` as the single
argument, and returns an `Observable` of a `MapGeocoderResponse`, which is an interface defined as
follows:

```typescript
export interface MapGeocoderResponse {
  status: google.maps.GeocoderStatus;
  results: google.maps.GeocoderResult[];
}
```

## Loading the Library

Using the `MapGeocoder` requires the Geocoding API to be enabled in Google Cloud Console on the
same project as the one set up for the Google Maps JavaScript API, and requires an API key that
has billing enabled. See [here](https://developers.google.com/maps/documentation/javascript/geocoding#GetStarted) for details.

## Example

```typescript
// google-maps-demo.component.ts
import {Component} from '@angular/core';
import {MapGeocoder} from '@angular/google-maps';

@Component({
  selector: 'google-map-demo',
  templateUrl: 'google-map-demo.html',
})
export class GoogleMapDemo {
  constructor(geocoder: MapGeocoder) {
    geocoder.geocode({
      address: '1600 Amphitheatre Parkway, Mountain View, CA'
    }).subscribe(({results}) => {
      console.log(results);
    });
  }
}
```
