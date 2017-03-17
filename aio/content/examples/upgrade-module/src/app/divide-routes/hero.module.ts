// #docregion
import { Component } from '@angular/core';
import { Hero } from '../hero';

@Component({
  template: `
    <h1>Hero detail</h1>
    <h2>{{hero.name}} - {{hero.description}}</h2>
  `
})
export class HeroDetailComponent {
  hero = new Hero(1, 'Windstorm', 'Specific powers of controlling winds');
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    // #docregion a-route
    RouterModule.forChild([
      { path: 'hero', children: [
        { path: '', component: HeroDetailComponent },
      ] },
    ])
    // #enddocregion a-route
  ],
  declarations: [ HeroDetailComponent ]
})
export class HeroModule {}
