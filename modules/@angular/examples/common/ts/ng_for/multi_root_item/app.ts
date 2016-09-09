/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion Component
import {Component, NgModule, animate, state, style, transition, trigger} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'example-app',
  template: `
    <nav class="actions">
      <button class="button" (click)="showAll()">Show All Countries</button> 
      <button class="button" (click)="hideAll()">Hide All Countries</button> 
    </nav>
    <dl class="definitions">
      <template ngFor let-country [ngForOf]="countries">
        <dt>{{ country.name }}</dt> 
        <dd>located in <strong>{{ country.continent }}</strong></dd> 
      </template>
    </dl>
  `
})
export class ExampleApp {
  countries: any[] = [];

  showAll() {
    this.countries = [
      { name: "USA", continent: "North America" },
      { name: "Canada", continent: "North America" },
      { name: "UK", continent: "Europe" },
      { name: "Czech Republic", continent: "Europe" },
      { name: "Slovakia", continent: "Europe" },
      { name: "Bulgaria", continent: "Europe" },
      { name: "Finland", continent: "Europe" },
      { name: "Russia", continent: "Europe" },
      { name: "China", continent: "Asia" },
      { name: "Japan", continent: "Asia" },
      { name: "India", continent: "Asia" },
      { name: "Australia", continent: "Oceania" }
    ]
  }

  hideAll() {
    this.countries = [];
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [ExampleApp],
  bootstrap: [ExampleApp]
})
export class AppModule {
}

// #enddocregion
