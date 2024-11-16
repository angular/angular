import {Component} from '@angular/core';
import {Observable} from 'rxjs';

import {Hero, HeroService} from './shared';
import {AsyncPipe, NgFor, NgIf, UpperCasePipe} from '@angular/common';

// #docregion example
/* avoid */

@Component({
  selector: 'toh-heroes',
  template: `
    <div>
      <h2>My Heroes</h2>
      <ul class="heroes">
        @for (hero of heroes | async; track hero) {
          <li (click)="selectedHero=hero">
            <span class="badge">{{hero.id}}</span> {{hero.name}}
          </li>
        }
      </ul>
      @if (selectedHero) {
        <div>
          <h2>{{selectedHero.name | uppercase}} is my hero</h2>
        </div>
      }
    </div>
  `,
  styles: [
    `
    .heroes {
      margin: 0 0 2em 0;
      list-style-type: none;
      padding: 0;
      width: 15em;
    }
    .heroes li {
      cursor: pointer;
      position: relative;
      left: 0;
      background-color: #EEE;
      margin: .5em;
      padding: .3em 0;
      height: 1.6em;
      border-radius: 4px;
    }
    .heroes .badge {
      display: inline-block;
      font-size: small;
      color: white;
      padding: 0.8em 0.7em 0 0.7em;
      background-color: #607D8B;
      line-height: 1em;
      position: relative;
      left: -1px;
      top: -4px;
      height: 1.8em;
      margin-right: .8em;
      border-radius: 4px 0 0 4px;
    }
  `,
  ],
  imports: [NgFor, NgIf, AsyncPipe, UpperCasePipe],
})
export class HeroesComponent {
  heroes: Observable<Hero[]>;
  selectedHero!: Hero;

  constructor(private heroService: HeroService) {
    this.heroes = this.heroService.getHeroes();
  }
}
// #enddocregion example
