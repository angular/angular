import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// #docregion import-housingLocation
import { HousingLocationComponent } from '../housing-location/housing-location.component';
// #enddocregion
@Component({
  selector: 'app-home',
  standalone: true,
  // #docregion add-housingLocation-to-array
  imports: [
    CommonModule,
    HousingLocationComponent
  ],
  // #enddocregion
  // #docregion add-housingLocation-to-template
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by city">
        <button class="primary" type="button">Search</button>
      </form>
    </section>
    <section class="results">
      <app-housing-location></app-housing-location>
    </section>
    `,
  // #enddocregion
  styleUrls: ['./home.component.css'],
})

export class HomeComponent {

}
