import {Component, signal} from '@angular/core';
import {form, FormField, required, validate} from '@angular/forms/signals';
import {ALL_COUNTRIES, CountrySelector} from './country-selector';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [CountrySelector, FormField],
})
export class App {
  // Signal Forms setup
  model = signal({country: ''});
  countryForm = form(this.model, (p) => {
    required(p.country, {message: 'Country selection is required'});

    validate(p.country, (ctx) => {
      const value = ctx.value();
      if (value && !ALL_COUNTRIES.includes(value)) {
        return {
          kind: 'invalidCountry',
          message: 'Please select a valid country.',
        };
      }
      return null;
    });
  });
}
