// #docplaster
// #docregion, v1
import { Component } from '@angular/core';
// #enddocregion v1
import { HeroService } from './hero.service';

// #docregion v1
@Component({
  selector: 'app-heroes',
    // #enddocregion v1
  providers: [ HeroService ],
  // #docregion v1
  template: `
    <h2>Heroes</h2>
    <app-hero-list></app-hero-list>
  `
})
export class HeroesComponent { }
