import {Component} from '@angular/core';
// #docregion import-ngfor
import {
  // #enddocregion import-ngfor
  NgIf,
  // #docregion import-ngfor
  NgFor,
  // #enddocregion import-ngfor
  UpperCasePipe,
  // #docregion import-ngfor
} from '@angular/common';
// #enddocregion import-ngfor
import {FormsModule} from '@angular/forms';

import {Hero} from '../hero';
// #docregion import-heroes
import {HEROES} from '../mock-heroes';
// #enddocregion import-heroes

// #docplaster
// #docregion metadata, import-ngfor
@Component({
  standalone: true,
  // #enddocregion import-ngfor
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  // #docregion import-ngfor
  imports: [
    // #enddocregion import-ngfor
    FormsModule,
    NgIf,
    // #docregion import-ngfor
    NgFor,
    // #enddocregion import-ngfor
    UpperCasePipe,
    // #docregion import-ngfor
  ],
})
// #enddocregion metadata, import-ngfor

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
