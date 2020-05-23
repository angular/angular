// #docregion
import { Component } from '@angular/core';

import { heroes } from './hero';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  heroes = heroes;
  hero = this.heroes[0];
  heroTraits = ['honest', 'brave', 'considerate'];

  // flags for the table

  attrDirs = true;
  strucDirs = true;
  divNgIf = false;

  showId = true;
  showDefaultTraits = true;
  showSad = true;
}
