import {NgFor} from '@angular/common';
import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';

@Component({
  selector: 'app-hero-list',
  template: `
    @for (hero of heroes; track hero) {
      <div>{{hero.id}} - {{hero.name}}</div>
    }
  `,
})
export class HeroListComponent {
  heroes = HEROES;
}
