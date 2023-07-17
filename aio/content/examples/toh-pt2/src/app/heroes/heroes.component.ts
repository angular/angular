import { Component } from '@angular/core';
import { Hero } from '../hero';
// #docregion import-heroes
import { HEROES } from '../mock-heroes';
// #enddocregion import-heroes

// #docplaster
// #docregion metadata
@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})
// #enddocregion metadata

// #docregion component
export class HeroesComponent {

  heroes = HEROES;
  // #enddocregion component
  // #docregion on-select
  selectedHero?: Hero;
 // #enddocregion on-select

  // #docregion on-select
  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
  // #enddocregion on-select
// #docregion component
}
// #enddocregion component
