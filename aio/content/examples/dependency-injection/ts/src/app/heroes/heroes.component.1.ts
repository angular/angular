// #docplaster
// #docregion full, v1
import { Component }          from '@angular/core';
// #enddocregion v1

import { HeroService }        from './hero.service';
// #enddocregion full

// #docregion full, v1

@Component({
  selector: 'my-heroes',
    // #enddocregion v1
  providers: [HeroService],
  // #docregion v1
  template: `
  <h2>Heroes</h2>
  <hero-list></hero-list>
  `
})
export class HeroesComponent { }
