import {Component, inject} from '@angular/core';
import {HousingLocationCard} from '../housing-location/housing-location';
import {HousingLocation} from '../housinglocation';
import {HousingAPI} from '../housing.service';

@Component({
  selector: 'app-home',
  imports: [HousingLocationCard],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by city" />
        <button class="primary" type="button">Search</button>
      </form>
    </section>
    <section class="results">
      @for(housingLocation of housingLocationList; track $index) {
        <app-housing-location-card [housingLocation]="housingLocation" />
      }
    </section>
  `,
  styleUrls: ['./home.css'],
})
export class Home {
  housingLocationList: HousingLocation[] = [];
  housingService: HousingAPI = inject(HousingAPI);

  constructor() {
    this.housingLocationList = this.housingService.getAllHousingLocations();
  }
}
