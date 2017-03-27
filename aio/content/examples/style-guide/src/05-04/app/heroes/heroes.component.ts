import { Component, OnInit } from '@angular/core';
import { Observable }        from 'rxjs/Observable';

import { Hero, HeroService } from './shared';

// #docregion example
@Component({
  selector: 'toh-heroes',
  templateUrl: './heroes.component.html',
  styleUrls:  ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
  heroes: Observable<Hero[]>;
  selectedHero: Hero;

 constructor(private heroService: HeroService) { }

  ngOnInit() {
    this.heroes = this.heroService.getHeroes();
  }
}
// #enddocregion example
