import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HousingLocationInfo} from '../housinglocation';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-housing-location',
  imports: [CommonModule, RouterModule],
  template: `
    <section class="listing">
      <img
        class="listing-photo"
        [src]="housingLocation.photo"
        alt="Exterior photo of {{ housingLocation.name }}"
        crossorigin
      />
      <h2 class="listing-heading">{{ housingLocation.name }}</h2>
      <p class="listing-location">{{ housingLocation.city }}, {{ housingLocation.state }}</p>
    </section>
  `,
  styleUrls: ['./housing-location.css'],
})
export class HousingLocation {
  @Input() housingLocation!: HousingLocationInfo;
}
