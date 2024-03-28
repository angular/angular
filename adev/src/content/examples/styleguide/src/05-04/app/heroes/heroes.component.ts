import {Component} from '@angular/core';
import {Observable} from 'rxjs';

import {Hero, HeroService} from './shared';
import {AsyncPipe, UpperCasePipe} from '@angular/common';

// #docregion example
@Component({
  standalone: true,
  selector: 'toh-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  imports: [AsyncPipe, UpperCasePipe],
})
export class HeroesComponent {
  heroes: Observable<Hero[]>;
  selectedHero!: Hero;

  constructor(private heroService: HeroService) {
    this.heroes = this.heroService.getHeroes();
  }
}
// #enddocregion example
