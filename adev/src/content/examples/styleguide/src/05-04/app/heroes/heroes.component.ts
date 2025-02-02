import {Component, inject} from '@angular/core';
import {Observable} from 'rxjs';

import {Hero, HeroService} from './shared';
import {AsyncPipe, NgFor, NgIf, UpperCasePipe} from '@angular/common';

// #docregion example
@Component({
  selector: 'toh-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  imports: [NgFor, NgIf, AsyncPipe, UpperCasePipe],
})
export class HeroesComponent {
  selectedHero!: Hero;

  private heroService = inject(HeroService);
  heroes: Observable<Hero[]> = this.heroService.getHeroes();
}
// #enddocregion example
