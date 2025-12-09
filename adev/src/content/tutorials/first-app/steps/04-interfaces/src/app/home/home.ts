import {Component} from '@angular/core';
import {HousingLocationCard} from '../housing-location/housing-location';

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
      <app-housing-location-card />
    </section>
  `,
  styleUrls: ['./home.css'],
})
export class Home {}
