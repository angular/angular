import { Component } from '@angular/core';

import { Hero, heroes } from './hero';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  heroes = heroes;
  hero = this.heroes[0];
  // #docregion condition
  condition = false;
  // #enddocregion condition
  logs: string[] = [];
  showSad = true;
  status = 'ready';

  trackById(index: number, hero: Hero): number { return hero.id; }
}
