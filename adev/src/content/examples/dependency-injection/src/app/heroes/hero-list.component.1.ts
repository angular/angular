import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';

@Component({
  standalone: true,
  selector: 'app-hero-list',
  template: `
    @for (hero of heroes; track hero) {
      <div>{{hero.id}} - {{hero.name}}</div>
    }
  `,
  imports: [],
})
export class HeroListComponent {
  heroes = HEROES;
}
