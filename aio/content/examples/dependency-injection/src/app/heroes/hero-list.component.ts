// #docregion
import { Component } from '@angular/core';
import { Hero } from './hero';
import { HeroService } from './hero.service';
import { NgFor } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-hero-list',
  template: `
    <div *ngFor="let hero of heroes">
      {{hero.id}} - {{hero.name}}
      ({{hero.isSecret ? 'secret' : 'public'}})
    </div>
  `,
  imports: [NgFor]
})
export class HeroListComponent {
  heroes: Hero[];

  // #docregion ctor-signature
  constructor(heroService: HeroService)
  // #enddocregion ctor-signature
  {
    this.heroes = heroService.getHeroes();
  }
}
