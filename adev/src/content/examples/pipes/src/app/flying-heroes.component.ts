// #docplaster
// #docregion
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {FlyingHeroesPipe, FlyingHeroesImpurePipe} from './flying-heroes.pipe';
import {HEROES} from './heroes';

@Component({
  selector: 'app-flying-heroes',
  templateUrl: './flying-heroes.component.html',
  imports: [CommonModule, FormsModule, FlyingHeroesPipe],
  styles: [
    `
    #flyers, #all {font-style: italic}
    button {display: block}
    input {margin: .25rem .25rem .5rem 0;}
  `,
  ],
})
// #docregion v1
export class FlyingHeroesComponent {
  heroes: any[] = [];
  canFly = true;
  // #enddocregion v1
  mutate = true;
  title = 'Flying Heroes (pure pipe)';

  // #docregion v1
  constructor() {
    this.reset();
  }

  addHero(name: string) {
    name = name.trim();
    if (!name) {
      return;
    }
    const hero = {name, canFly: this.canFly};
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
      this.heroes = this.heroes.concat(hero);
    }
    // #docregion v1
  }

  reset() {
    this.heroes = HEROES.slice();
  }
}
// #enddocregion v1

////// Identical except for impure pipe //////
@Component({
  selector: 'app-flying-heroes-impure',
  templateUrl: './flying-heroes-impure.component.html',
  imports: [CommonModule, FormsModule, FlyingHeroesImpurePipe],
  styles: [
    '#flyers, #all {font-style: italic}',
    'button {display: block}',
    'input {margin: .25rem .25rem .5rem 0;}',
  ],
})
export class FlyingHeroesImpureComponent extends FlyingHeroesComponent {
  override title = 'Flying Heroes (impure pipe)';
}
