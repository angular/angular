import {Component, input} from '@angular/core';
import {HousingLocation} from '../housinglocation';

@Component({
  selector: 'app-housing-location-card',
  imports: [],
  template: `
    <section class="listing">
      <img
        class="listing-photo"
        [src]="housingLocation().photo"
        alt="Exterior photo of {{ housingLocation().name }}"
        crossorigin
      />
      <h2 class="listing-heading">{{ housingLocation().name }}</h2>
      <p class="listing-location">{{ housingLocation().city }}, {{ housingLocation().state }}</p>
    </section>
  `,
  styleUrls: ['./housing-location.css'],
})
export class HousingLocationCard {
  housingLocation = input.required<HousingLocation>();
}
