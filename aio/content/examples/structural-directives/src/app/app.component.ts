// #docregion
import { Component } from '@angular/core';

import { Hero, heroes } from './hero';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  heroes = heroes;
  hero = this.heroes[0];

  condition = false;
  logs: string[] = [];
  showSad = true;
  status = 'ready';

  // #docregion trackByHero
  trackById(index: number, hero: Hero): number { return hero.id; }
  // #enddocregion trackByHero
}
