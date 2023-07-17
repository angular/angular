// #docregion
import { Component } from '@angular/core';

import { Hero, heroes } from './hero';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  heroes = heroes;
  hero: Hero | null = this.heroes[0];
  heroTraits = ['honest', 'brave', 'considerate'];

  // flags for the table

  attrDirs = true;
  strucDirs = true;
  divNgIf = false;

  showId = true;
  showDefaultTraits = true;
  showSad = true;
}
