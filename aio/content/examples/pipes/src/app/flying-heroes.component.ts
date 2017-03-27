// #docplaster
// #docregion
import { Component }              from '@angular/core';

import { HEROES }                 from './heroes';

@Component({
  selector: 'flying-heroes',
  templateUrl: './flying-heroes.component.html',
  styles: ['#flyers, #all {font-style: italic}']
})
// #docregion v1
export class FlyingHeroesComponent {
  heroes: any[] = [];
  canFly = true;
// #enddocregion v1
  mutate = true;
  title = 'Flying Heroes (pure pipe)';

// #docregion v1
  constructor() { this.reset(); }

  addHero(name: string) {
    name = name.trim();
    if (!name) { return; }
    let hero = {name, canFly: this.canFly};
// #enddocregion v1
    if (this.mutate) {
    // Pure pipe won't update display because heroes array reference is unchanged
    // Impure pipe will display
// #docregion v1
// #docregion push
    this.heroes.push(hero);
// #enddocregion push
// #enddocregion v1
    } else {
      // Pipe updates display because heroes array is a new object
// #docregion concat
      this.heroes = this.heroes.concat(hero);
// #enddocregion concat
    }
// #docregion v1
  }

  reset() { this.heroes = HEROES.slice(); }
}
// #enddocregion v1

////// Identical except for impure pipe //////
// #docregion impure-component
@Component({
  selector: 'flying-heroes-impure',
  templateUrl: './flying-heroes-impure.component.html',
// #enddocregion impure-component
  styles: ['.flyers, .all {font-style: italic}'],
// #docregion impure-component
})
export class FlyingHeroesImpureComponent extends FlyingHeroesComponent {
  title = 'Flying Heroes (impure pipe)';
}
// #enddocregion impure-component
