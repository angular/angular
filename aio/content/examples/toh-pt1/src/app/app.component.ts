import {Component} from '@angular/core';
// #docregion heroes-import
import {HeroesComponent} from './heroes/heroes.component';
// #enddocregion heroes-import

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // #docregion heroes-import
  imports: [HeroesComponent],
  // #enddocregion heroes-import
})
export class AppComponent {
  title = 'Tour of Heroes';
}
