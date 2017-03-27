// #docregion
import { Component } from '@angular/core';

// #docregion import
import { Hero } from './hero';
// #enddocregion import

@Component({
  selector: 'my-app',
  // #docregion template
  template: `
    <h1>{{title}}</h1>
    <h2>My favorite hero is: {{myHero.name}}</h2>
    <p>Heroes:</p>
    <ul>
      <li *ngFor="let hero of heroes">
        {{ hero.name }}
      </li>
    </ul>
  `
  // #enddocregion template
})
// #docregion class
export class AppComponent {
  title = 'Tour of Heroes';
  // #docregion heroes
  heroes = [
    new Hero(1, 'Windstorm'),
    new Hero(13, 'Bombasto'),
    new Hero(15, 'Magneta'),
    new Hero(20, 'Tornado')
  ];
  myHero = this.heroes[0];
  // #enddocregion heroes
}
