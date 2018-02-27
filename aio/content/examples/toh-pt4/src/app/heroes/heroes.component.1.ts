import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { Observable } from 'rxjs';

class DummyHeroesComponent {

  heroes: Observable<Hero[]>;

  constructor(private heroService: HeroService) {}

  // #docregion getHeroes
  getHeroes(): void {
    // #docregion get-heroes
    this.heroes = this.heroService.getHeroes();
    // #enddocregion get-heroes
  }
  // #enddocregion getHeroes
}

