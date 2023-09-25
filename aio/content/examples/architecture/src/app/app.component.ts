// #docregion import
import { Component } from '@angular/core';
// #enddocregion import

import { HeroListComponent } from './hero-list.component';
import { SalesTaxComponent } from './sales-tax.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <h1>Architecture Example</h1>
    <app-hero-list></app-hero-list>
    <app-sales-tax></app-sales-tax>
  `,
  imports: [HeroListComponent, SalesTaxComponent]
})
export class AppComponent { }
