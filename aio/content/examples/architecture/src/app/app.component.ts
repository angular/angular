// #docregion import
import { Component } from '@angular/core';
// #enddocregion import

@Component({
  selector: 'app-root',
  template: `
    <h1>Architecture Example</h1>
    <app-hero-list></app-hero-list>
    <app-sales-tax></app-sales-tax>
  `
})
export class AppComponent { }
