// #docregion
import {Component, inject, OnInit} from '@angular/core';

import {HeroArena, HeroService, Hero} from './heroes';

@Component({
  selector: 'toh-app',
  template: '<pre>{{heroes | json}}</pre>',
  providers: [HeroArena, HeroService],
  standalone: false,
})
export class AppComponent {
  heroes: Hero[] = [];

  private heroArena = inject(HeroArena);

  constructor() {
    this.heroArena.getParticipants().subscribe((heroes) => (this.heroes = heroes));
  }
}
