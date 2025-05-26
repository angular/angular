// #docregion
import {Component} from '@angular/core';
import {Hero} from './hero';
import {HeroService} from './hero.service';
import {NgFor} from '@angular/common';

@Component({
  selector: 'app-hero-list',
  template: `
    @for (hero of heroes; track hero) {
      <div>
        {{hero.id}} - {{hero.name}}
        ({{hero.isSecret ? 'secret' : 'public'}})
      </div>
    }
  `,
})
export class HeroListComponent {
  heroes: Hero[];

  // #docregion ctor-signature
  constructor(
    heroService: HeroService, // #enddocregion ctor-signature
  ) {
    this.heroes = heroService.getHeroes();
  }
}
