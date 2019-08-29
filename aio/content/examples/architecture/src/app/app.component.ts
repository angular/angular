// #docregion import
import { Component } from '@angular/core';
// #enddocregion import

@Component({
  selector: 'app-root',
  template: `
    <app-hero-list></app-hero-list>
    <app-sales-tax></app-sales-tax>
  `
})
// #docregion export
export class AppComponent { }
// #enddocregion export
