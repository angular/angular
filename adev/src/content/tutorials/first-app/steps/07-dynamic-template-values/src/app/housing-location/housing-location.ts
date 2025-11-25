import {Component, input} from '@angular/core';
import {HousingLocation} from '../housinglocation';

@Component({
  selector: 'app-housing-location-card',
  template: `
    <p>housing-location works!</p>
  `,
  styleUrls: ['./housing-location.css'],
})
export class HousingLocationCard {
  housingLocation = input.required<HousingLocation>();
}
