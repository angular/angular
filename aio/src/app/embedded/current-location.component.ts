/* tslint:disable component-selector */
import { Component } from '@angular/core';
import { LocationService } from 'app/shared/location.service';

/**
 * A simple embedded component that displays the current location path
 */
@Component({
  selector: 'current-location',
  template: '{{location.path()}}'
})
export class CurrentLocationComponent {
  constructor(public location: LocationService) {
  }
}
